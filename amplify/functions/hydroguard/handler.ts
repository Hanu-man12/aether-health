import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

const SYSTEM_PROMPT = `You are HydroGuard, a water quality and environmental safety AI.
Generate realistic water quality reports based on location/context.
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
    const { location, userProfile } = body;

    const prompt = `${SYSTEM_PROMPT}

User Language: ${userProfile?.language || 'en'}
Location context: ${location || 'general urban area'}

Generate a water quality safety report. Return JSON:
{
  "waterQualityRisk": "Low|Moderate|High",
  "reportSummary": "string",
  "whatThisMeans": "string",
  "safetyAdvice": "string",
  "reassuranceLine": "string",
  "reasoningSummary": "string",
  "emotionalState": "Calm"
}`;

    const response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 512, temperature: 0.4 },
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
    console.error('HydroGuard error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Water quality report failed. Please try again.' }),
    };
  }
};
