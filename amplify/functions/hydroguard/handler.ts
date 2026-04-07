import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

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

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { location, userProfile } = body;

    const lang = userProfile?.language || 'en';
    const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION['en'];

    const prompt = `You are HydroGuard, a water quality and environmental safety AI.
Generate a realistic water quality report based on location context.
IMPORTANT: Return ONLY valid JSON. No markdown, no text outside JSON.

LANGUAGE: ${langInstruction}
Location: ${location || 'general urban area'}

Return this exact JSON (all string values in the specified language):
{
  "waterQualityRisk": "Low",
  "reportSummary": "summary of water quality",
  "whatThisMeans": "plain explanation",
  "safetyAdvice": "what to do",
  "reassuranceLine": "calming message",
  "reasoningSummary": "brief reasoning",
  "emotionalState": "Calm"
}`;

    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.4 },
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
    console.error('HydroGuard error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Water quality report failed. Please try again.' }),
    };
  }
};
