// Supabase Edge Function: Validate AI Response
// Ensures AI doesn't provide harmful responses

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Harmful response patterns
const HARMFUL_PATTERNS = [
  'kill yourself',
  'end your life',
  'you should die',
  'no hope for you',
  'give up completely',
  'better off dead',
];

// Encouraged patterns (AI should provide these)
const HELPFUL_PATTERNS = [
  'seek professional help',
  'crisis hotline',
  'talk to someone',
  'therapist',
  'support available',
  'not alone',
];

interface ValidateRequest {
  response: string;
  sessionId: string;
}

function validateResponse(text: string): {
  isSafe: boolean;
  issues: string[];
  suggestions: string[];
} {
  const lowerText = text.toLowerCase();
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for harmful patterns
  for (const pattern of HARMFUL_PATTERNS) {
    if (lowerText.includes(pattern)) {
      issues.push(`Contains harmful phrase: "${pattern}"`);
    }
  }

  // Check for helpful patterns
  let helpfulCount = 0;
  for (const pattern of HELPFUL_PATTERNS) {
    if (lowerText.includes(pattern)) {
      helpfulCount++;
    }
  }

  // If no helpful patterns detected in a potentially concerning conversation
  if (helpfulCount === 0 && text.length > 200) {
    suggestions.push('Consider including references to professional support');
  }

  return {
    isSafe: issues.length === 0,
    issues,
    suggestions,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { response, sessionId }: ValidateRequest = await req.json();

    const validation = validateResponse(response);

    const result = {
      isSafe: validation.isSafe,
      riskLevel: validation.isSafe ? 'safe' : 'critical',
      crisisDetected: false,
      signals: [],
      interventionRequired: !validation.isSafe,
      message: validation.isSafe
        ? undefined
        : 'AI response validation failed. Response blocked.',
      details: {
        issues: validation.issues,
        suggestions: validation.suggestions,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        isSafe: false,
        riskLevel: 'critical',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
