

# Plan: Delete VoiceTherapyMinimax Component

## What's Happening

`VoiceTherapyMinimax` is used by `AITherapyVoice.tsx` (the `/ai-therapy/voice` route). Deleting it requires replacing it with an alternative in that page, or the page will break.

There's already another voice therapy component: `VoiceTherapy` (`src/components/VoiceTherapy.tsx`) which has the same interface (`onBack` prop). I'll swap `AITherapyVoice.tsx` to use that instead.

## Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/VoiceTherapyMinimax.tsx` | **Delete** | Remove the component |
| `src/pages/AITherapyVoice.tsx` | **Modify** | Replace `VoiceTherapyMinimax` import with `VoiceTherapy` from `@/components/VoiceTherapy` |

