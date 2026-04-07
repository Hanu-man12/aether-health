import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

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
      const mime = imageBase64.split(';')[0].split('/')[1];
      if (mime === 'png') format = 'png';
      else if (mime === 'webp') format = 'webp';
      else if (mime === 'gif') format = 'gif';
      rawBase64 = imageBase64.split(',')[1];
    }

    // InvokeModel API requires base64 string (not binary) for image bytes
    const prompt = `You are ClearScript, a Clinical Pharmacist AI. Analyze this prescription image.

CRITICAL RULES:
1. ALL JSON field values MUST be in English only - no Hindi, Bengali, or any other script
2. For ocrInterpretation: transliterate/translate the prescription content to English
3. Keep medication names as standard medical names (e.g. "Paracetamol 500mg")
4. Do NOT repeat characters or words - if unsure, write "unclear"
5. Return ONLY valid JSON, no markdown

Return this exact JSON structure:
{
  "ocrInterpretation": "English transliteration of prescription text",
  "medications": [
    {
      "name": "medication name in English",
      "dosage": "e.g. 500mg",
      "frequency": "e.g. Twice daily (BID)",
      "duration": "e.g. 7 days",
      "instructions": "plain English patient instructions",
      "confidence": "High"
    }
  ],
  "ambiguityFlags": ["any unclear parts in English"],
  "graphologyAnalysis": [
    {
      "observedStroke": "description in English",
      "interpretedAs": "medication or instruction in English",
      "confidence": "High",
      "strokePressure": "Medium",
      "slant": "Vertical"
    }
  ],
  "verificationRequired": true,
  "safetyAdvice": "safety advice in English",
  "reassuranceLine": "reassuring message in English",
  "reasoningSummary": "brief summary in English"
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

    // Extract JSON - find outermost { }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      console.error('No JSON found in response. Text length:', text.length);
      return {
        statusCode: 200,
        body: JSON.stringify({
          ocrInterpretation: 'Could not extract text from prescription.',
          medications: [],
          ambiguityFlags: ['Image may be unclear or unsupported format.'],
          verificationRequired: true,
          safetyAdvice: 'Please consult your pharmacist directly.',
          reassuranceLine: 'Try uploading a clearer image.',
          reasoningSummary: 'AI could not parse the prescription.',
        }),
      };
    }

    const jsonStr = text.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('JSON parse failed. Length:', jsonStr.length, 'Error:', parseErr);
      // Return safe fallback instead of 500
      return {
        statusCode: 200,
        body: JSON.stringify({
          ocrInterpretation: 'Prescription detected but could not be fully decoded.',
          medications: [],
          ambiguityFlags: ['Response parsing failed. Please try again with a clearer image.'],
          verificationRequired: true,
          safetyAdvice: 'Please verify all medications with your pharmacist.',
          reassuranceLine: 'Try again with better lighting or a higher resolution photo.',
          reasoningSummary: 'Partial decode - manual verification required.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error('ClearScript error:', err?.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err?.message || 'Prescription analysis failed. Please try again.' }),
    };
  }
};
