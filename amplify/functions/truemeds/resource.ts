import { defineFunction } from '@aws-amplify/backend';

export const truemeds = defineFunction({
  name: 'truemeds',
  entry: './handler.ts',
  timeoutSeconds: 60,
  environment: {
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
    BEDROCK_REGION: 'us-east-1',
  },
});
