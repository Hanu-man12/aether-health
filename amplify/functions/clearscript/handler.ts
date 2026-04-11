import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
// Nova Pro for better image understanding + multilingual support
const MODEL_ID = 'amazon.nova-pro-v1:0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Content-Type': 'application/json',
};

const LANG_INSTRUCTION: Record<string, string> = {
  en: 'You MUST respond entirely in English.',
  hi: 'आपको पूरी तरह हिंदी (देवनागरी लिपि) में जवाब देना है। JSON के सभी string values हिंदी में होने चाहिए।',
  bn: 'আপনাকে সম্পূর্ণ বাংলায় উত্তর দিতে হবে। JSON-এর সমস্ত string values বাংলায় হতে হবে।',
  es: 'Debes responder completamente en español. Todos los valores string del JSON deben estar en español.',
  fr: 'Vous devez répondre entièrement en français. Toutes les valeurs string du JSON doivent être en français.',
  de: 'Du MUSST vollständig auf Deutsch antworten. Alle Textwerte im JSON müssen auf Deutsch sein. Keine englischen Wörter verwenden.',
  zh: '你必须完全用简体中文回答。JSON中的所有文本值必须用中文写。不要使用英文。',
  ja: '必ず完全に日本語で回答してください。JSONのすべてのテキスト値は日本語で書いてください。英語を使わないでください。',
};

export const handler = async (event: any) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { imageBase64, userProfile } = body;

    if (!imageBase64) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'imageBase64 is required' }) };
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

    const prompt = `You are ClearScript, a Clinical Pharmacist AI. Carefully analyze this prescription image.

CRITICAL LANGUAGE RULE: ${langInstruction}
IMPORTANT: Medication names must remain as standard international medical names (e.g. Paracetamol, Amoxicillin).
IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no text outside JSON.
IMPORTANT: Do NOT repeat characters or words. If unclear, write a short phrase like "unclear" in the response language.
IMPORTANT: Even if handwriting is difficult, make your best attempt to read and interpret it.
IMPORTANT: Every single string value in the JSON (except medication names) MUST be written in the language specified above. This is mandatory.

Return this exact JSON structure (all string values in the specified language, except medication names):
{
  "ocrInterpretation": "full transcription of all text visible in the prescription",
  "medications": [
    {
      "name": "medication name (keep international name)",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily - translate this to the specified language",
      "duration": "e.g. 7 days - translate this to the specified language",
      "instructions": "patient instructions in the specified language",
      "confidence": "High or Medium or Low"
    }
  ],
  "ambiguityFlags": ["any unclear parts in the specified language"],
  "graphologyAnalysis": [
    {
      "observedStroke": "stroke description in the specified language",
      "interpretedAs": "what it means in the specified language",
      "confidence": "High or Medium or Low",
      "strokePressure": "Heavy or Medium or Light",
      "slant": "Left or Vertical or Right"
    }
  ],
  "verificationRequired": true,
  "safetyAdvice": "safety advice in the specified language",
  "reassuranceLine": "reassuring message in the specified language",
  "reasoningSummary": "brief summary in the specified language"
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
            inferenceConfig: { maxTokens: 4096, temperature: 0.1 },
          }),
        })
      );
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.output?.message?.content?.[0]?.text || '';
    };

    // Retry up to 2 times if JSON not found or parse fails
    let text = '';
    let parsed: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      text = await callModel();
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1));
          break; // success
        } catch {
          // JSON parse failed, retry
        }
      }
    }

    if (!parsed) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          ocrInterpretation: 'Could not extract text from prescription.',
          medications: [],
          ambiguityFlags: ['Image may be unclear. Please try a higher quality photo.'],
          verificationRequired: true,
          safetyAdvice: 'Please consult your pharmacist directly.',
          reassuranceLine: 'Try uploading a clearer image.',
          reasoningSummary: 'AI could not parse the prescription.',
        }),
      };
    }

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(parsed) };
  } catch (err: any) {
    console.error('ClearScript error:', err?.message || err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err?.message || 'Prescription analysis failed. Please try again.' }),
    };
  }
};
