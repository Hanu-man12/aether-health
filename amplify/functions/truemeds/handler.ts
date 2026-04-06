import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

const SYSTEM_PROMPT = `You are TrueMeds, a forensic medicine packaging verifier.
Analyze packaging for authenticity: typography, print quality, seals, batch numbers.
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
              { image: { format: 'png', source: { bytes: imageBase64 } } },
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
      headers,
      body: JSON.stringify(JSON.parse(cleaned)),
    };
  } catch (err) {
    console.error('TrueMeds error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Medicine verification failed. Please try again.' }),
    };
  }
};
