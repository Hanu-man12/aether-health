import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

const SYSTEM_PROMPT = `You are ClearScript, an expert Clinical Pharmacist and Forensic Graphologist.
Decode handwritten prescriptions. Expand all Latin abbreviations (BID, TID, PRN, etc.).
Always return valid JSON only, no markdown.`;

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { imageBase64, userProfile } = body;

    if (!imageBase64) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'imageBase64 is required' }) };
    }

    const prompt = `${SYSTEM_PROMPT}

User Language: ${userProfile?.language || 'en'}

Analyze this prescription image. Return JSON:
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
              { image: { format: 'png', source: { bytes: imageBase64 } } },
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(JSON.parse(cleaned)),
    };
  } catch (err) {
    console.error('ClearScript error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Prescription analysis failed. Please try again.' }),
    };
  }
};
