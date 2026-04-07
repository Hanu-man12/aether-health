/**
 * fetch-lambda-urls.mjs
 * Runs during Amplify build to inject production Lambda URLs into .env
 * Works for both sandbox and production - always fetches live URLs from AWS
 */

import { LambdaClient, ListFunctionsCommand, ListFunctionUrlConfigsCommand } from '@aws-sdk/client-lambda';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const REGION = process.env.AWS_REGION || process.env.BEDROCK_REGION || 'us-east-1';
const client = new LambdaClient({ region: REGION });

const FUNCTION_KEYS = {
  vitalscan: 'VITE_LAMBDA_VITALSCAN',
  clearscript: 'VITE_LAMBDA_CLEARSCRIPT',
  truemeds: 'VITE_LAMBDA_TRUEMEDS',
  hydroguard: 'VITE_LAMBDA_HYDROGUARD',
};

async function getFunctionUrl(functionName) {
  try {
    const res = await client.send(new ListFunctionUrlConfigsCommand({ FunctionName: functionName }));
    return res.FunctionUrlConfigs?.[0]?.FunctionUrl || null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fetching Lambda function list...');
  const res = await client.send(new ListFunctionsCommand({ MaxItems: 50 }));
  const functions = res.Functions || [];

  const urlMap = {};

  for (const [key, envVar] of Object.entries(FUNCTION_KEYS)) {
    const match = functions.find(f => f.FunctionName.toLowerCase().includes(key));
    if (match) {
      const url = await getFunctionUrl(match.FunctionName);
      if (url) {
        urlMap[envVar] = url.endsWith('/') ? url : url + '/';
        console.log(`  ${envVar} = ${urlMap[envVar]}`);
      } else {
        console.warn(`  WARNING: No URL config found for ${match.FunctionName}`);
      }
    } else {
      console.warn(`  WARNING: No Lambda found matching "${key}"`);
    }
  }

  // Read existing .env (if any) and overwrite only the VITE_LAMBDA_ lines
  let envContent = existsSync('.env') ? readFileSync('.env', 'utf8') : '';

  for (const [envVar, url] of Object.entries(urlMap)) {
    const regex = new RegExp(`^${envVar}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${envVar}=${url}`);
    } else {
      envContent += `\n${envVar}=${url}`;
    }
  }

  writeFileSync('.env', envContent.trim() + '\n');
  console.log('.env updated with production Lambda URLs.');
}

main().catch(err => {
  console.error('fetch-lambda-urls failed:', err);
  process.exit(1);
});
