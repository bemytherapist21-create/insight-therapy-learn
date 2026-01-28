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
      // Get auth session for token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/perplexity-research", {
        method: "POST",
        headers,
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Research failed: ${response.status}`;

        if (errorMessage.includes("Authentication required") ||
          errorMessage.includes("Invalid or expired token")) {
          throw new Error("AUTH_REQUIRED");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

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

