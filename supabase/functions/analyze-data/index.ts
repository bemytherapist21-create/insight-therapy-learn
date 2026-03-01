import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, fileContent, fileName, parsedStructure, columnDefinitions, businessContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (mode === "parse") {
      // Parse file structure using AI
      const sampleContent = fileContent.length > 15000 ? fileContent.substring(0, 15000) + "\n... (truncated)" : fileContent;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a data analysis expert. Analyze the uploaded file content and extract its structure. Return a JSON response using the suggest_structure tool.`,
            },
            {
              role: "user",
              content: `Analyze this file "${fileName}":\n\n${sampleContent}\n\nIdentify all sheets/tabs, columns, data types, null percentages (estimate), unique value counts for categorical fields, and summary stats for numeric fields. If it's a CSV, treat it as a single sheet called "Sheet1".`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "suggest_structure",
                description: "Return the parsed file structure",
                parameters: {
                  type: "object",
                  properties: {
                    sheets: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          columns: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                dataType: { type: "string", enum: ["numeric", "categorical", "date", "text", "boolean"] },
                                nullPercentage: { type: "number" },
                                uniqueValues: { type: "number" },
                                sampleValues: { type: "array", items: { type: "string" } },
                                summary: { type: "string" },
                              },
                              required: ["name", "dataType"],
                              additionalProperties: false,
                            },
                          },
                          rowCount: { type: "number" },
                        },
                        required: ["name", "columns"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["sheets"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "suggest_structure" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        console.error("AI gateway error:", status, text);
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const structure = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify({ structure }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error("Failed to parse file structure");
    }

    if (mode === "insights") {
      // Generate insights with streaming
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a Context-Aware Business Intelligence AI. Generate comprehensive business insights based on the data structure, column definitions, and business context provided.

Your response MUST be valid JSON with this structure:
{
  "executive_summary": "Brief overview of key findings",
  "descriptive": [{"title": "...", "finding": "...", "metric": "...", "chart_type": "bar|line|pie|area"}],
  "diagnostic": [{"title": "...", "finding": "...", "root_cause": "..."}],
  "predictive": [{"title": "...", "prediction": "...", "confidence": "high|medium|low", "timeframe": "..."}],
  "strategic": [{"title": "...", "recommendation": "...", "impact": "high|medium|low", "effort": "high|medium|low"}],
  "risks": [{"title": "...", "description": "...", "severity": "high|medium|low"}],
  "market_context": "Analysis of external market factors",
  "kpis": [{"name": "...", "value": "...", "trend": "up|down|stable", "description": "..."}]
}

Reference actual column names from the data. Never hallucinate data values. If confidence is low, state uncertainty. Separate data-driven insights from market-driven insights.`,
            },
            {
              role: "user",
              content: `Data Structure: ${JSON.stringify(parsedStructure)}

Column Definitions: ${JSON.stringify(columnDefinitions)}

Business Context: ${JSON.stringify(businessContext)}

Generate comprehensive insights in all 4 layers: Descriptive, Diagnostic, Predictive, and Strategic. Include KPIs, risks, and market context.`,
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        console.error("AI gateway error:", status, text);
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid mode. Use 'parse' or 'insights'." }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-data error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
