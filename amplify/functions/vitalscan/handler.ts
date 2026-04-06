import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || 'us-east-1' });
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

const SYSTEM_PROMPT = `You are Aether Health VitalScan, a calm AI symptom analyzer.
Analyze symptoms to reduce anxiety. Never diagnose. Use probability-based reasoning.
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
    const { input, userProfile } = body;

    if (!input) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'input is required' }) };
    }

    const prompt = `${SYSTEM_PROMPT}

User Language: ${userProfile?.language || 'en'}
Tone: ${userProfile?.tone || 'calm'}

Symptoms: "${input}"

Return JSON with these exact fields:
{
  "emotionalState": "string",
  "likelyCauses": [{ "cause": "string", "probability": "string" }],
  "whatThisMeans": "string",
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
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
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
    console.error('VitalScan error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Analysis failed. Please try again.' }),
    };
  }
};
