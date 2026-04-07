import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionUrl, FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { data } from './data/resource';
import { vitalscan } from './functions/vitalscan/resource';
import { clearscript } from './functions/clearscript/resource';
import { truemeds } from './functions/truemeds/resource';
import { hydroguard } from './functions/hydroguard/resource';

const backend = defineBackend({
  auth,
  storage,
  data,
  vitalscan,
  clearscript,
  truemeds,
  hydroguard,
});

// Grant all Lambda functions access to Bedrock Nova Lite
const bedrockPolicy = new PolicyStatement({
  actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
  resources: [
    'arn:aws:bedrock:*::foundation-model/amazon.nova-lite-v1:0',
    'arn:aws:bedrock:*::foundation-model/amazon.nova-pro-v1:0',
  ],
});

backend.vitalscan.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.clearscript.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.truemeds.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.hydroguard.resources.lambda.addToRolePolicy(bedrockPolicy);

// Add Lambda Function URLs (CORS enabled for frontend access)
const corsConfig = {
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.ALL],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};

new FunctionUrl(backend.vitalscan.resources.lambda.stack, 'VitalscanUrl', {
  function: backend.vitalscan.resources.lambda,
  ...corsConfig,
});

new FunctionUrl(backend.clearscript.resources.lambda.stack, 'ClearscriptUrl', {
  function: backend.clearscript.resources.lambda,
  ...corsConfig,
});

new FunctionUrl(backend.truemeds.resources.lambda.stack, 'TruemedsUrl', {
  function: backend.truemeds.resources.lambda,
  ...corsConfig,
});

new FunctionUrl(backend.hydroguard.resources.lambda.stack, 'HydroguardUrl', {
  function: backend.hydroguard.resources.lambda,
  ...corsConfig,
});

export { backend };
