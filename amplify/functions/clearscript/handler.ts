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
      // No data URI prefix - detect from base64 magic bytes
      const header = rawBase64.substring(0, 12);
      if (header.startsWith('iVBORw')) format = 'png';           // PNG
      else if (header.startsWith('UklGR')) format = 'webp';      // RIFF/WebP
      else if (header.startsWith('R0lGOD')) format = 'gif';      // GIF
      else format = 'jpeg';                                        // default JPEG
    }

    const lang = userProfile?.language || 'en';
    const langInstruction = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION['en'];

    const prompt = `You are ClearScript, a Clinical Pharmacist AI. Analyze this prescription image.

LANGUAGE: ${langInstruction}
IMPORTANT: Keep medication names as standard international medical names (e.g. Paracetamol, Amoxicillin).
IMPORTANT: Return ONLY valid JSON. No markdown, no explanation outside JSON.
IMPORTANT: Do NOT repeat characters or words. If a section is unclear, write a short phrase like "unclear" in the response language.

Return this exact JSON structure (all string values in the specified language):
{
  "ocrInterpretation": "transcription/translation of prescription text",
  "medications": [
    {
      "name": "medication name",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 7 days",
      "instructions": "patient instructions",
      "confidence": "High"
    }
  ],
  "ambiguityFlags": ["any unclear parts"],
  "graphologyAnalysis": [
    {
      "observedStroke": "stroke description",
      "interpretedAs": "what it means",
      "confidence": "High",
      "strokePressure": "Medium",
      "slant": "Vertical"
    }
  ],
  "verificationRequired": true,
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
          inferenceConfig: { maxTokens: 2048, temperature: 0.1 },
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.output?.message?.content?.[0]?.text || '';

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return {
        statusCode: 200,
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

    let parsed;
    try {
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ocrInterpretation: 'Prescription detected but could not be fully decoded.',
          medications: [],
          ambiguityFlags: ['Please try again with a clearer image.'],
          verificationRequired: true,
          safetyAdvice: 'Please verify all medications with your pharmacist.',
          reassuranceLine: 'Try again with better lighting or higher resolution.',
          reasoningSummary: 'Partial decode - manual verification required.',
        }),
      };
    }

    return { statusCode: 200, body: JSON.stringify(parsed) };
  } catch (err: any) {
    console.error('ClearScript error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err?.message || 'Prescription analysis failed. Please try again.' }),
    };
  }
};
