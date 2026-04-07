import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-pro-v1:0';

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { imageBase64, userProfile } = body;

    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'imageBase64 is required' }) };
    }

    // Detect format from data URI or default to jpeg
    let format: 'jpeg' | 'png' | 'gif' | 'webp' = 'jpeg';
    let rawBase64 = imageBase64;
    if (imageBase64.startsWith('data:')) {
      const mime = imageBase64.split(';')[0].split('/')[1];
      if (mime === 'png') format = 'png';
      else if (mime === 'webp') format = 'webp';
      else if (mime === 'gif') format = 'gif';
      rawBase64 = imageBase64.split(',')[1];
    }

    // InvokeModel API requires base64 string for image bytes (not binary/Buffer)
    const imageBase64ForBedrock = rawBase64;

    const prompt = `You are ClearScript, an expert Clinical Pharmacist and Forensic Graphologist.
Decode this handwritten prescription image. Expand all Latin abbreviations (BID, TID, PRN, etc.).
User Language: ${userProfile?.language || 'en'}

Return ONLY valid JSON, no markdown, no explanation:
{
  "ocrInterpretation": "string",
  "medications": [{
    "name": "string",
    "dosage": "string",
    "frequency": "string",
    "duration": "string",
    "instructions": "string",
    "confidence": "High|Medium|Low"
  }],
  "ambiguityFlags": ["string"],
  "graphologyAnalysis": [{
    "observedStroke": "string",
    "interpretedAs": "string",
    "confidence": "string",
    "strokePressure": "Light|Medium|Heavy",
    "slant": "Left|Vertical|Right"
  }],
  "verificationRequired": true,
  "safetyAdvice": "string",
  "reassuranceLine": "string",
  "reasoningSummary": "string"
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
              { image: { format, source: { bytes: imageBase64ForBedrock } } },
              { text: prompt },
            ],
          }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.2 },
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.output?.message?.content?.[0]?.text || '{}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('ClearScript JSON parse error:', parseErr, 'Raw text:', text);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to parse AI response.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error('ClearScript error:', err?.message || err, err?.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err?.message || 'Prescription analysis failed. Please try again.' }),
    };
  }
};
