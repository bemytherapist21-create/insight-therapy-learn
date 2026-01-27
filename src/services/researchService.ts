import { logger } from "./loggingService";

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
      // Get auth token if user is logged in
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      // Add Authorization header if user is authenticated
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perplexity-research`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Research failed");
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

