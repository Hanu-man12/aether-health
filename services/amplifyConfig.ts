/**
 * amplifyConfig.ts
 * 
 * After running `npx ampx sandbox`, Lambda Function URLs will be printed in the terminal.
 * Copy them here and call configureLambdaUrls() in index.tsx.
 * 
 * Format from sandbox output:
 *   vitalscan: https://xxxx.lambda-url.us-east-1.on.aws/
 *   clearscript: https://xxxx.lambda-url.us-east-1.on.aws/
 *   truemeds: https://xxxx.lambda-url.us-east-1.on.aws/
 *   hydroguard: https://xxxx.lambda-url.us-east-1.on.aws/
 */

export const LAMBDA_URLS = {
  vitalscan: import.meta.env.VITE_LAMBDA_VITALSCAN || '',
  clearscript: import.meta.env.VITE_LAMBDA_CLEARSCRIPT || '',
  truemeds: import.meta.env.VITE_LAMBDA_TRUEMEDS || '',
  hydroguard: import.meta.env.VITE_LAMBDA_HYDROGUARD || '',
  lifeloop: import.meta.env.VITE_LAMBDA_LIFELOOP || '',
  polly: import.meta.env.VITE_LAMBDA_POLLY || '',
};
