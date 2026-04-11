import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
// Nova Pro for better multilingual + image understanding
const MODEL_ID = 'amazon.nova-pro-v1:0';

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'You MUST respond entirely in English.',
  hi: 'आपको पूरी तरह हिंदी (देवनागरी लिपि) में जवाब देना है। JSON के सभी string values हिंदी में होने चाहिए। कोई भी अंग्रेजी शब्द उपयोग न करें।',
  bn: 'আপনাকে সম্পূর্ণ বাংলায় উত্তর দিতে হবে। JSON-এর সমস্ত string values বাংলায় হতে হবে। কোনো ইংরেজি শব্দ ব্যবহার করবেন না।',
  es: 'Debes responder completamente en español. Todos los valores string del JSON deben estar en español.',
  fr: 'Vous devez répondre entièrement en français. Toutes les valeurs string du JSON doivent être en français.',
  de: 'Sie müssen vollständig auf Deutsch antworten. Alle String-Werte im JSON müssen auf Deutsch sein.',
  zh: '您必须完全用简体中文回答。JSON中的所有字符串值必须用中文。',
  ja: '完全に日本語で回答してください。JSONのすべての文字列値は日本語でなければなりません。',
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
Analyze this medicine packaging image for authenticity: typography, print quality, seals, batch numbers, hologram, expiry date.

CRITICAL LANGUAGE RULE: ${langInstruction}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no text outside JSON.
All string values in the JSON must be in the language specified above.
Medicine name can remain in its standard international form.

Return this exact JSON structure:
{
  "medicineIdentified": "medicine name as seen on packaging",
  "authenticityConfidence": "High or Medium or Low",
  "redFlags": ["list any suspicious elements, or empty array if none"],
  "safetyAdvice": "safety advice in the specified language",
  "reassuranceLine": "reassuring message in the specified language",
  "reasoningSummary": "brief analysis summary in the specified language"
}`;

    const callModel = async (): Promise<string> => {
      const response = await client.send(
        new InvokeModelCommand({
          modelId: MODEL_ID,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            system: [{ text: langInstruction }],
            messages: [{
              role: 'user',
              content: [
                { image: { format, source: { bytes: rawBase64 } } },
                { text: prompt },
              ],
            }],
            inferenceConfig: { maxTokens: 2048, temperature: 0.1 },
          }),
        })
      );
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.output?.message?.content?.[0]?.text || '';
    };

    let parsed: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const text = await callModel();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1));
          break;
        } catch { /* retry */ }
      }
    }

    if (!parsed) throw new Error('No JSON in response after retries');

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error('TrueMeds error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Medicine verification failed. Please try again.' }),
    };
  }
};
