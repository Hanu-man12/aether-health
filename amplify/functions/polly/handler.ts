import { PollyClient, SynthesizeSpeechCommand, Engine, LanguageCode, VoiceId } from '@aws-sdk/client-polly';

const client = new PollyClient({ region: process.env.POLLY_REGION || 'us-east-1' });

// Language → Polly voice mapping (Neural engine preferred)
const LANG_TO_POLLY: Record<string, { voiceId: VoiceId; languageCode: LanguageCode; engine: Engine }> = {
  en: { voiceId: 'Joanna',   languageCode: 'en-US', engine: 'neural' },
  hi: { voiceId: 'Kajal',    languageCode: 'hi-IN', engine: 'neural' },
  bn: { voiceId: 'Kajal',    languageCode: 'hi-IN', engine: 'neural' }, // Polly has no Bengali — use Hindi neural as closest
  es: { voiceId: 'Lupe',     languageCode: 'es-US', engine: 'neural' },
  fr: { voiceId: 'Lea',      languageCode: 'fr-FR', engine: 'neural' },
  de: { voiceId: 'Vicki',    languageCode: 'de-DE', engine: 'neural' },
  zh: { voiceId: 'Zhiyu',    languageCode: 'cmn-CN', engine: 'neural' },
  ja: { voiceId: 'Kazuha',   languageCode: 'ja-JP', engine: 'neural' },
};

const FALLBACK: { voiceId: VoiceId; languageCode: LanguageCode; engine: Engine } = {
  voiceId: 'Joanna',
  languageCode: 'en-US',
  engine: 'neural',
};

export const handler = async (event: any) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { text, language = 'en' } = body;

    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'text is required' }),
      };
    }

    const config = LANG_TO_POLLY[language] || FALLBACK;

    // Truncate to Polly limit (3000 chars for neural)
    const safeText = text.length > 2900 ? text.substring(0, 2900) + '...' : text;

    const command = new SynthesizeSpeechCommand({
      Text: safeText,
      OutputFormat: 'mp3',
      VoiceId: config.voiceId,
      LanguageCode: config.languageCode,
      Engine: config.engine,
    });

    const response = await client.send(command);

    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }

    // Convert stream to base64
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.AudioStream as any) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, format: 'mp3' }),
    };
  } catch (err: any) {
    console.error('Polly TTS error:', err?.message || err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'TTS generation failed' }),
    };
  }
};
