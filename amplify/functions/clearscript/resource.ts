import { defineFunction } from '@aws-amplify/backend';

export const clearscript = defineFunction({
  name: 'clearscript',
  entry: './handler.ts',
  timeoutSeconds: 60,
  environment: {
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
    BEDROCK_REGION: 'us-east-1',
  },
});
