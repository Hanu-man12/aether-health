import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'aetherHealthUploads',
  access: (allow) => ({
    // Users can upload/read their own files
    'uploads/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
