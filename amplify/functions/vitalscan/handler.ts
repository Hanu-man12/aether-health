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
    const { input, userProfile } = body;

    if (!input) {
      return { statusCode: 400, body: JSON.stringify({ error: 'input is required' }) };
    }

    const lang = userProfile?.language || 'en';
    const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION['en'];

    const prompt = `You are Aether Health VitalScan, a calm AI symptom analyzer.
Analyze symptoms to reduce anxiety. Never diagnose. Use probability-based reasoning.
IMPORTANT: Return ONLY valid JSON. No markdown, no text outside JSON.

LANGUAGE: ${langInstruction}
Tone: ${userProfile?.tone || 'calm'}

Symptoms: "${input}"

Return this exact JSON (all string values in the specified language):
{
  "emotionalState": "e.g. Calm / Anxious",
  "likelyCauses": [
    { "cause": "cause name", "probability": "e.g. 60%" }
  ],
  "whatThisMeans": "plain explanation",
  "safetyAdvice": "what to do",
  "reassuranceLine": "calming message",
  "reasoningSummary": "brief reasoning"
}`;

    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
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
    console.error('VitalScan error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Analysis failed. Please try again.' }),
    };
  }
};
