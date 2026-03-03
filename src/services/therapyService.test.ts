import { describe, it, expect, vi, beforeEach } from "vitest";
import { therapyService } from "./therapyService";
import { supabase } from "@/integrations/supabase/safeClient";

// Mock Supabase client
vi.mock("@/integrations/supabase/safeClient", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn() })) })),
      update: vi.fn(() => ({ eq: vi.fn() })),
    })),
  },
}));

describe("TherapyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("analyzeEmotion", () => {
    it("should return emotion from edge function", async () => {
      // Setup mock response
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      mockInvoke.mockResolvedValueOnce({
        data: { emotion: "happy" },
        error: null,
      });

      const emotion = await therapyService.analyzeEmotion("I feel good");

      expect(mockInvoke).toHaveBeenCalledWith("analyze-emotion", {
        body: { text: "I feel good" },
      });
      expect(emotion).toBe("happy");
    });

    it('should default to "mixed" on error', async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: new Error("API Error"),
      });

      const emotion = await therapyService.analyzeEmotion("I feel good");

      expect(emotion).toBe("mixed");
    });
  });

  describe("createAvatarTalk", () => {
    it("should return talk ID on success", async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      mockInvoke.mockResolvedValueOnce({
        data: { id: "talk_123" },
        error: null,
      });

      const talkId = await therapyService.createAvatarTalk("Hello world");

      expect(mockInvoke).toHaveBeenCalledWith("did-avatar", {
        body: { action: "create", text: "Hello world" },
      });
      expect(talkId).toBe("talk_123");
    });

    it("should return null on error", async () => {
      const mockInvoke = vi.mocked(supabase.functions.invoke);
      mockInvoke.mockResolvedValueOnce({
        data: null,
        error: new Error("Failed"),
      });

      const talkId = await therapyService.createAvatarTalk("Hello");
      expect(talkId).toBeNull();
    });
  });
});
