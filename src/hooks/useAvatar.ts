import { useState, useCallback, useRef, useEffect } from "react";
import { therapyService } from "@/services/therapyService";
import { logger } from "@/services/loggingService";

export const useAvatar = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const generateAvatar = useCallback(async (text: string) => {
    setIsGenerating(true);
    setAvatarUrl(null);

    try {
      const talkId = await therapyService.createAvatarTalk(text);

      if (!talkId) {
        setIsGenerating(false);
        return;
      }

      // Poll for result
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds max (2s interval)

      // Clear any existing interval
      if (pollInterval.current) clearInterval(pollInterval.current);

      pollInterval.current = setInterval(async () => {
        attempts++;

        if (attempts >= maxAttempts) {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setIsGenerating(false);
          logger.warn("Avatar generation timed out");
          return;
        }

        const url = await therapyService.pollAvatarResult(talkId);

        if (url) {
          if (pollInterval.current) clearInterval(pollInterval.current);
          setAvatarUrl(url);
          setIsGenerating(false);
          logger.info("Avatar generated successfully");
        }
      }, 2000);
    } catch (error) {
      logger.error(
        "Avatar generation hook error",
        error instanceof Error ? error : undefined,
      );
      setIsGenerating(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  return {
    isGenerating,
    avatarUrl,
    generateAvatar,
  };
};
