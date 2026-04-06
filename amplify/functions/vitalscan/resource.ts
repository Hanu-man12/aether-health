import { defineFunction } from '@aws-amplify/backend';

export const vitalscan = defineFunction({
  name: 'vitalscan',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
    BEDROCK_REGION: 'us-east-1',
  },
});
