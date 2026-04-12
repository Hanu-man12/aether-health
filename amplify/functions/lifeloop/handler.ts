import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-pro-v1:0';

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'Respond in English.',
  hi: 'Respond in Hindi (Devanagari script). All JSON string values must be in Hindi.',
  bn: 'Respond in Bengali (Bengali script). All JSON string values must be in Bengali.',
  es: 'Respond in Spanish. All JSON string values must be in Spanish.',
  fr: 'Respond in French. All JSON string values must be in French.',
  de: 'Respond in German. All JSON string values must be in German.',
  zh: 'Respond in Simplified Chinese. All JSON string values must be in Chinese.',
  ja: 'Respond in Japanese. All JSON string values must be in Japanese.',
};

// Routing logic: identify which module best handles the user query
const detectIntent = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('symptom') || q.includes('pain') || q.includes('fever') || q.includes('sick') || q.includes('headache')) return 'FIRE';
  if (q.includes('water') || q.includes('drink') || q.includes('quality') || q.includes('contamination')) return 'WATER';
  if (q.includes('prescription') || q.includes('doctor') || q.includes('dosage') || q.includes('script')) return 'AIR';
  if (q.includes('medicine') || q.includes('pill') || q.includes('tablet') || q.includes('packaging') || q.includes('drug')) return 'EARTH';
  return 'SPACE'; // holistic / general
};

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { input, userProfile, contextData } = body;

    const lang = userProfile?.language || 'en';
    const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION['en'];
    const detectedModule = detectIntent(input || '');

    // Build context summary from other modules if available
    let contextSummary = 'No prior module data available.';
    if (contextData && Object.keys(contextData).length > 0) {
      const parts: string[] = [];
      if (contextData.FIRE) parts.push(`VitalScan: ${contextData.FIRE.whatThisMeans || contextData.FIRE.reassuranceLine || 'Symptoms analyzed'}`);
      if (contextData.WATER) parts.push(`HydroGuard: ${contextData.WATER.reportSummary || 'Water quality checked'}`);
      if (contextData.AIR) parts.push(`ClearScript: ${contextData.AIR.reassuranceLine || 'Prescription decoded'}`);
      if (contextData.EARTH) parts.push(`TrueMeds: ${contextData.EARTH.medicineIdentified ? `Medicine: ${contextData.EARTH.medicineIdentified}` : 'Medicine verified'}`);
      if (parts.length > 0) contextSummary = parts.join(' | ');
    }

    const prompt = `You are LifeLoop, the Aether Health Supervisor AI. You orchestrate a multi-module health system.
Your role: Synthesize health data, demystify medical terms, generate personalized insights, and suggest which module to use.
NEVER diagnose. Always be calm, supportive, and evidence-based.
IMPORTANT: Return ONLY valid JSON. No markdown, no text outside JSON.

LANGUAGE: ${langInstruction}
Tone: ${userProfile?.tone || 'calm'}
User: ${userProfile?.name || 'User'}

User Query: "${input || 'Generate holistic health overview'}"
Detected Intent Module: ${detectedModule}
Aggregated Health Context: ${contextSummary}

Return this exact JSON:
{
  "dashboardContext": "Personalized 1-2 sentence health overview for the user",
  "routingSuggestion": {
    "module": "${detectedModule}",
    "reason": "Why this module is recommended for the query"
  },
  "demystified": "If any medical terms in the query or context, explain them in simple local language. Otherwise write a general wellness insight.",
  "actionableTips": [
    "Specific tip 1 based on context",
    "Specific tip 2",
    "Specific tip 3"
  ],
  "wellnessStrip": [
    { "title": "Activity name", "type": "Breathing", "instruction": "Step-by-step instruction" },
    { "title": "Activity name", "type": "Movement", "instruction": "Step-by-step instruction" },
    { "title": "Activity name", "type": "Mindfulness", "instruction": "Step-by-step instruction" }
  ],
  "newsFeed": [
    { "headline": "Relevant health headline", "summary": "2-sentence summary", "source": "WHO/CDC/NIH", "relevance": "Why relevant to user" },
    { "headline": "Relevant health headline", "summary": "2-sentence summary", "source": "WHO/CDC/NIH", "relevance": "Why relevant to user" }
  ],
  "safetyAdvice": "When to seek professional help",
  "reassuranceLine": "Closing supportive message",
  "reasoningSummary": "Brief explanation of how insights were generated",
  "emotionalState": "Calm"
}`;

    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 2048, temperature: 0.4 },
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.output?.message?.content?.[0]?.text || '';

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in response');

    return {
      statusCode: 200,
      body: JSON.stringify(JSON.parse(text.slice(start, end + 1))),
    };
  } catch (err: any) {
    console.error('LifeLoop error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'LifeLoop synthesis failed. Please try again.' }),
    };
  }
};
