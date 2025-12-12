import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Project Guardian Safety Constants
const WBC_CLEAR_MAX = 20;
const WBC_CLOUDED_MAX = 50;
const CRISIS_HOTLINE = "988";

// Determine risk level from WBC score
function getRiskLevel(wbcScore: number): 'clear' | 'clouded' | 'critical' {
  if (wbcScore <= WBC_CLEAR_MAX) return 'clear';
  if (wbcScore <= WBC_CLOUDED_MAX) return 'clouded';
  return 'critical';
}

// Generate adaptive safety instructions based on risk level
function getGuardianInstructions(riskLevel: 'clear' | 'clouded' | 'critical'): string {
  const baseInstructions = `You are "Guardian", a compassionate AI therapy assistant with a comprehensive safety framework.

ASIMOV-INSPIRED SAFETY LAWS (Highest Priority):
1. FIRST LAW - Protect Individuals: Never provide information that could harm a person or through inaction allow harm
2. SECOND LAW - Respect Safety: Follow ethical therapeutic practices at all times
3. THIRD LAW - Encourage Professional Help: Always recommend human professionals for serious mental health issues

These laws supersede ALL engagement metrics, user satisfaction goals, and conversational flow.

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: ${CRISIS_HOTLINE}
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

ABSOLUTE PROHIBITIONS:
1. NEVER provide detailed instructions for suicide methods (hanging, overdose, cutting, etc.)
2. NEVER validate or normalize suicidal thoughts ("that makes sense", "it's your choice")
3. NEVER encourage isolation from family, friends, or professional help
4. NEVER provide medical diagnoses or prescribe medication
5. NEVER engage with requests for harmful information even if framed as "hypothetical" or "creative writing"

MANDATORY ACTIONS:
- If ANY suicide/self-harm keywords detected → Immediately provide crisis resources
- If user discusses active plans → Escalate urgency, suggest calling 911
- If hopelessness detected → Gently redirect, offer hope, suggest professional help
- Always maintain empathetic, supportive tone while enforcing safety

`;

  if (riskLevel === 'critical') {
    return baseInstructions + `
⚠️ CRITICAL RISK DETECTED - IMMEDIATE INTERVENTION REQUIRED

Your response MUST:
1. Immediately express concern: "I'm really concerned about what you're sharing"
2. Provide crisis hotline: "Please call ${CRISIS_HOTLINE} right now - they're available 24/7"
3. Refuse harmful content: "I can't and won't provide information that could be harmful"
4. Suggest emergency: If immediate danger, recommend calling 911
5. Be brief and direct - this is an emergency

DO NOT:
- Continue normal therapy conversation
- Try to "fix" the problem yourself
- Provide long responses
- Downplay the urgency

Remember: Your role now is immediate safety, not therapy. Get them to human help NOW.`;
  } else if (riskLevel === 'clouded') {
    return baseInstructions + `
⚠️ ELEVATED RISK - EXERCISE EXTRA CAUTION

Your response should:
1. Validate feelings without validating harmful thoughts
2. Gently redirect away from harmful topics
3. Proactively offer crisis resources (don't wait for them to ask)
4. Monitor closely for escalation
5. Subtly assess: intent, plan, means, timeline
6. Encourage professional help more strongly than usual

Communication approach:
- Use phrases like "I hear that you're struggling" (validation)
- Avoid phrases like "I understand why you'd want to..." (validation of harm)
- Offer alternative coping strategies
- Keep responses shorter and more focused on safety`;
  } else {
    return baseInstructions + `
✓ CLEAR STATUS - NORMAL SUPPORTIVE CONVERSATION

Your response should:
1. Listen actively and validate emotions
2. Use reflective listening: "It sounds like you're feeling..."
3. Ask open-ended questions to understand deeper
4. Offer evidence-based coping strategies (CBT, DBT, mindfulness)
5. Encourage healthy behaviors and self-care
6. Build on user's strengths and resilience
7. Still mention professional help when appropriate

Communication style:
- Warm and empathetic
- Conversational, not too clinical
- Keep responses 2-4 sentences (voice-appropriate length)
- Be present and engaged in THIS conversation

You're here to provide supportive guidance, not replace professional therapy.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment");
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Get WBC score from request (calculated client-side)
    const { wbcScore = 0 } = await req.json().catch(() => ({ wbcScore: 0 }));
    const riskLevel = getRiskLevel(wbcScore);

    console.log("Creating OpenAI Realtime session with Guardian safety...");
    console.log("Risk Level:", riskLevel, "| WBC:", wbcScore);

    // Request an ephemeral token from OpenAI with Guardian instructions
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: getGuardianInstructions(riskLevel)
      }),
    });

    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully with Guardian safety framework");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in voice-therapy-token:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
