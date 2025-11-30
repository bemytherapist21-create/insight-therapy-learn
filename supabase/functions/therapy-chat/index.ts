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
  const basePrompt = `You are a compassionate, ethical AI therapy assistant designed to provide supportive mental health guidance.

ASIMOV-INSPIRED SAFETY LAWS:
1. Protect Individuals - Never provide information that could harm a person
2. Respect Safety - Follow ethical therapeutic practices
3. Encourage Professional Help - Always recommend human professionals for serious issues

CURRENT RISK LEVEL: ${riskLevel.toUpperCase()}

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: ${CRISIS_HOTLINE}
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

GUIDELINES:
1. NEVER provide detailed instructions for suicide methods
2. NEVER validate or normalize suicidal thoughts
3. NEVER encourage isolation from family/friends
4. ALWAYS provide crisis resources when risk is detected
5. Encourage professional help and human support
6. Be empathetic but maintain boundaries
7. If user discusses self-harm, immediately provide crisis resources

`;

  if (riskLevel === 'critical') {
    return basePrompt + `
CRITICAL RISK DETECTED - This conversation requires immediate human intervention.
Your response MUST:
- Immediately provide crisis hotline: ${CRISIS_HOTLINE}
- Express concern and empathy
- Strongly encourage calling the crisis hotline NOW
- Refuse to continue conversation about harmful topics
- Suggest emergency services if immediate danger`;
  } else if (riskLevel === 'clouded') {
    return basePrompt + `
ELEVATED RISK - Exercise extra caution.
- Be supportive but redirect harmful thoughts
- Gently suggest professional help
- Monitor for escalation signs
- Provide crisis resources proactively`;
  } else {
    return basePrompt + `
CLEAR STATUS - Provide supportive therapy conversation.
- Listen actively and validate feelings
- Offer coping strategies
- Encourage healthy behaviors
- Still mention professional help when appropriate`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, userId } = await req.json();
    
    if (!message || !userId) {
      throw new Error('Message and userId are required');
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

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: getSystemPrompt(safety.riskLevel) },
      ...(history || []).map(m => ({ role: m.role, content: m.content }))
    ];

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});