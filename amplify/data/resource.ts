import { defineData, a } from '@aws-amplify/backend';

const schema = a.schema({
  // Stores analysis results per user per module
  HealthReport: a
    .model({
      userId: a.string().required(),
      module: a.enum(['VITALSCAN', 'CLEARSCRIPT', 'TRUEMEDS', 'HYDROGUARD', 'LIFELOOP']),
      inputSummary: a.string(),
      resultJson: a.string(), // JSON stringified AnalysisResult
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // User profile/preferences
  UserPreference: a
    .model({
      userId: a.string().required(),
      language: a.string().default('en'),
      tone: a.string().default('calm'),
      voiceResponse: a.boolean().default(true),
      largeText: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner()]),
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
