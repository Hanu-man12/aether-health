import { defineFunction } from '@aws-amplify/backend';

export const lifeloop = defineFunction({
  name: 'lifeloop',
  entry: './handler.ts',
  timeoutSeconds: 90,
  environment: {
    BEDROCK_MODEL_ID: 'amazon.nova-pro-v1:0',
    BEDROCK_REGION: 'us-east-1',
  },
});
