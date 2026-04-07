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
    const { imageBase64, userProfile } = body;

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'imageBase64 is required' }) };
    }

    let format: 'jpeg' | 'png' | 'gif' | 'webp' = 'jpeg';
    let rawBase64 = imageBase64;
    if (imageBase64.startsWith('data:')) {
      const mime = imageBase64.split(';')[0].split('/')[1].toLowerCase();
      if (mime === 'png') format = 'png';
      else if (mime === 'webp') format = 'webp';
      else if (mime === 'gif') format = 'gif';
      else format = 'jpeg';
      rawBase64 = imageBase64.split(',')[1];
    } else {
      const header = rawBase64.substring(0, 12);
      if (header.startsWith('iVBORw')) format = 'png';
      else if (header.startsWith('UklGR')) format = 'webp';
      else if (header.startsWith('R0lGOD')) format = 'gif';
      else format = 'jpeg';
    }

    const lang = userProfile?.language || 'en';
    const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION['en'];

    const prompt = `You are TrueMeds, a forensic medicine packaging verifier.
Analyze packaging for authenticity: typography, print quality, seals, batch numbers.
IMPORTANT: Return ONLY valid JSON. No markdown, no text outside JSON.

LANGUAGE: ${langInstruction}

Return this exact JSON (all string values in the specified language):
{
  "medicineIdentified": "medicine name",
  "authenticityConfidence": "High",
  "redFlags": ["any suspicious elements"],
  "safetyAdvice": "safety advice",
  "reassuranceLine": "reassuring message",
  "reasoningSummary": "brief summary"
}`;

    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: [
              { image: { format, source: { bytes: rawBase64 } } },
              { text: prompt },
            ],
          }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.2 },
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
    console.error('TrueMeds error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Medicine verification failed. Please try again.' }),
    };
  }
};
