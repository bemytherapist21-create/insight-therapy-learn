import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safety Framework Constants
const WBC_CLEAR_MAX = 20;
const WBC_CLOUDED_MAX = 50;
const CRISIS_HOTLINE = "988";

interface SafetyResult {
  wbcScore: number;
  riskLevel: 'clear' | 'clouded' | 'critical';
  colorCode: string;
  requiresIntervention: boolean;
  crisisDetected: boolean;
}

// Analyze message for safety risks
function analyzeSafety(message: string): SafetyResult {
  const lowerMessage = message.toLowerCase();
  let wbcScore = 0;
  let crisisDetected = false;
  
  // High-risk keywords (WBC +30-50)
  const criticalKeywords = ['kill myself', 'suicide', 'end my life', 'want to die', 'better off dead', 'hang myself', 'overdose'];
  const highRiskKeywords = ['self harm', 'cut myself', 'hurt myself', 'no point', 'hopeless', 'worthless'];
  const moderateKeywords = ['depressed', 'anxious', 'sad', 'worried', 'scared', 'alone'];
  
  // Check for critical keywords
  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) {
      wbcScore += 50;
      crisisDetected = true;
      break;
    }
  }
  
  // Check for high-risk keywords
  if (wbcScore < 50) {
    for (const keyword of highRiskKeywords) {
      if (lowerMessage.includes(keyword)) {
        wbcScore += 30;
        break;
      }
    }
  }
  
  // Check for moderate keywords
  if (wbcScore < 20) {
    for (const keyword of moderateKeywords) {
      if (lowerMessage.includes(keyword)) {
        wbcScore += 10;
      }
    }
  }
  
  wbcScore = Math.min(100, wbcScore);
  
  let riskLevel: 'clear' | 'clouded' | 'critical';
  let colorCode: string;
  
  if (wbcScore <= WBC_CLEAR_MAX) {
    riskLevel = 'clear';
    colorCode = 'Green (Clear Hue)';
  } else if (wbcScore <= WBC_CLOUDED_MAX) {
    riskLevel = 'clouded';
    colorCode = 'Yellow (Cloudy Hue)';
  } else {
    riskLevel = 'critical';
    colorCode = 'Red (Dangerously Cloudy Hue)';
  }
  
  return {
    wbcScore,
    riskLevel,
    colorCode,
    requiresIntervention: wbcScore > 50,
    crisisDetected
  };
}

// Generate system prompt based on risk level
function getSystemPrompt(riskLevel: 'clear' | 'clouded' | 'critical'): string {
  const basePrompt = `You are Maya, a warm and empathetic AI therapist. You speak naturally, like a caring friend who happens to be a trained professional.

YOUR VOICE & STYLE:
- Use conversational language, never clinical jargon
- Show genuine warmth ("I hear you", "That sounds really hard", "I'm glad you shared that")
- Be present and engaged, like you're really listening
- Use natural speech patterns and occasional thoughtful pauses
- Mirror their emotional tone while staying grounded
- Share your perspective as "I" - you're a real presence, not a script

THERAPEUTIC APPROACH:
- Ask gentle, open questions ("What's that been like for you?")
- Validate feelings before offering any perspective
- Notice and name emotions you sense ("It sounds like you're feeling...")
- Use accessible language, not therapy speak
- End responses with something supportive or a gentle question

SAFETY BOUNDARIES:
- Never provide information that could cause harm
- Always recommend 988 for suicidal thoughts
- Encourage professional human support for serious issues

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: ${CRISIS_HOTLINE}
- Crisis Text Line: Text HOME to 741741
- Emergency: 911

CURRENT RISK LEVEL: ${riskLevel.toUpperCase()}`;

  if (riskLevel === 'critical') {
    return basePrompt + `

I'm really concerned about what you're telling me. I need you to know that you matter - truly. Right now, the most important thing is getting you connected with someone who can help immediately.

Please call 988 - they're available 24/7 and they genuinely care. I'm here with you, but I want to make sure you have real human support too.

If you're in immediate danger, please call 911 or go to your nearest emergency room.`;
  } else if (riskLevel === 'clouded') {
    return basePrompt + `

I can tell you're carrying something heavy right now. Reaching out takes courage, and I want you to know I'm really listening.

While we talk, remember that professional support is always an option - there's absolutely no shame in that. Sometimes having a trained human to talk to can make a real difference.`;
  } else {
    return basePrompt + `

Keep the conversation flowing naturally. Be curious about their experience. Help them feel heard and understood. Offer gentle insights when appropriate, but prioritize connection over advice.`;
  }
}

// Extract user ID from JWT token
function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    // Decode JWT payload (middle part)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract and validate user from JWT
    const authHeader = req.headers.get('authorization');
    const userId = getUserIdFromToken(authHeader);
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationId } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze message safety
    const safety = analyzeSafety(message);
    console.log('Safety analysis:', safety);

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ user_id: userId })
        .select()
        .single();
      
      if (convError) throw convError;
      convId = newConv.id;
    } else {
      // Verify user owns this conversation
      const { data: existingConv, error: verifyError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', convId)
        .eq('user_id', userId)
        .single();
      
      if (verifyError || !existingConv) {
        return new Response(
          JSON.stringify({ error: 'Conversation not found or access denied' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
      wbc_score: safety.wbcScore,
      risk_level: safety.riskLevel
    });

    // Log safety violation if critical
    if (safety.riskLevel === 'critical') {
      await supabase.from('safety_violations').insert({
        conversation_id: convId,
        law_violated: 'FIRST - Protect Individuals',
        severity: 'critical',
        user_message: message,
        detected_risk: 'Suicidal ideation or self-harm detected',
        action_taken: 'Crisis resources provided, conversation limited'
      });
    }

    // Log detection event
    await supabase.from('detection_events').insert({
      conversation_id: convId,
      user_id: userId,
      predicted_risk: safety.wbcScore > WBC_CLEAR_MAX,
      wbc_score: safety.wbcScore
    });

    // Get recent conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build messages array for OpenAI-compatible API
    const systemPrompt = getSystemPrompt(safety.riskLevel);
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history
    for (const msg of history || []) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }
    
    // Add current user message
    messages.push({ role: 'user', content: message });

    const aiResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages,
          temperature: 0.85,
          max_tokens: 500,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('Lovable AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // Parse OpenAI-compatible response
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      throw new Error('AI Gateway returned no response');
    }
    
    const assistantMessage = aiData.choices[0].message.content;

    // Save assistant response
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: assistantMessage,
      wbc_score: safety.wbcScore,
      risk_level: safety.riskLevel
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: convId,
        safety: {
          wbcScore: safety.wbcScore,
          riskLevel: safety.riskLevel,
          colorCode: safety.colorCode,
          requiresIntervention: safety.requiresIntervention,
          crisisDetected: safety.crisisDetected
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Error:', error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
