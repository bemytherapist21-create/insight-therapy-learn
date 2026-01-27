import { logger } from "./loggingService";
import { supabase } from "@/integrations/supabase/safeClient";

export interface ResearchResult {
  content: string;
  citations: string[];
}

class ResearchService {
  /**
   * Generates a research report or insight based on a query.
   * @param query The business or research question.
   */
  async generateInsight(query: string): Promise<ResearchResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke(
        "perplexity-research",
        {
          body: { query },
        }
      );

      if (error) {
        // Standardize auth-related errors so the UI can react
        if (
          typeof error.message === "string" &&
          (error.message.includes("Authentication required") ||
            error.message.includes("Invalid or expired token"))
        ) {
          throw new Error("AUTH_REQUIRED");
        }
        throw new Error(error.message || "Research failed");
      }

      if (!data) {
        throw new Error("No data returned from research function");
      }

      logger.info("Research insight generated successfully");
      return {
        content: data.content || "No insight generated.",
        citations: data.citations || [],
      };
    } catch (error) {
      logger.error(
        "Failed to generate insight",
        error instanceof Error ? error : new Error("Unknown error")
      );
      return null;
    }
  }
}

export const researchService = new ResearchService();

