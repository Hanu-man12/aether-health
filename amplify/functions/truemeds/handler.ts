import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-pro-v1:0';

const SYSTEM_PROMPT = `You are TrueMeds, a forensic medicine packaging verifier.
Analyze packaging for authenticity: typography, print quality, seals, batch numbers.
Always return valid JSON only, no markdown.`;

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

    const prompt = `${SYSTEM_PROMPT}

User Language: ${userProfile?.language || 'en'}

Perform forensic verification on this medicine packaging. Return JSON:
{
  "medicineIdentified": "string",
  "authenticityConfidence": "High|Medium|Low",
  "redFlags": ["string"],
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
          inferenceConfig: { maxTokens: 512, temperature: 0.2 },
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const text = responseBody.output?.message?.content?.[0]?.text || '{}';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
      statusCode: 200,
      body: JSON.stringify(JSON.parse(cleaned)),
    };
  } catch (err) {
    console.error('TrueMeds error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Medicine verification failed. Please try again.' }),
    };
  }
};
