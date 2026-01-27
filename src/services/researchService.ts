import { logger } from "./loggingService";

export interface ResearchResult {
  content: string;
  citations: string[];
}

class ResearchService {
  private apiKey: string;
  private baseUrl = "https://api.perplexity.ai/chat/completions";

  constructor() {
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || "";
  }

  /**
   * Generates a research report or insight based on a query.
   * @param query The business or research question.
   */
  async generateInsight(query: string): Promise<ResearchResult | null> {
    if (!this.apiKey) {
      logger.error(
        "Perplexity API key is missing. Please set VITE_PERPLEXITY_API_KEY.",
      );
      return null;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model: "sonar", // Customizable model
          messages: [
            {
              role: "system",
              content:
                "You are a high-level business strategy consultant. Provide concise, data-driven insights with strategic recommendations. Focus on trends, opportunities, and risks.",
            },
            {
              role: "user",
              content: query,
            },
          ],
          temperature: 0.2,
          top_p: 0.9,
          frequency_penalty: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const content =
        data.choices[0]?.message?.content || "No insight generated.";
      const citations = data.citations || [];

      logger.info("Research insight generated successfully");
      return { content, citations };
    } catch (error) {
      logger.error(
        "Failed to generate insight",
        error instanceof Error ? error : undefined,
      );
      return null;
    }
  }
}

export const researchService = new ResearchService();
