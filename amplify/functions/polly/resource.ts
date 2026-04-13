import { defineFunction } from '@aws-amplify/backend';

export const polly = defineFunction({
  name: 'polly',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    POLLY_REGION: 'us-east-1',
  },
});
