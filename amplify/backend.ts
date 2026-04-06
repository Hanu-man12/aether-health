import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
  resources: ['arn:aws:bedrock:*::foundation-model/amazon.nova-lite-v1:0'],
});

backend.vitalscan.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.clearscript.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.truemeds.resources.lambda.addToRolePolicy(bedrockPolicy);
backend.hydroguard.resources.lambda.addToRolePolicy(bedrockPolicy);

export { backend };
