import { HttpMethod } from '@activepieces/pieces-common';
import { PieceAuth } from '@activepieces/pieces-framework';
import { simpleVerifierRequest } from './common/client';

type MeResponse = {
  ok?: boolean;
  email?: string;
  plan?: string;
};

const AUTH_DESCRIPTION = `To get your API key:

1. Sign in at https://simpleverifier.com.
2. Open the [API keys page](https://simpleverifier.com/api-keys) and create a key.
3. Copy the key (it starts with \`sv_live_\` and is shown once) and paste it here.

API access comes with the Pro, Business and Agency plans (see https://simpleverifier.com/pricing). The Starter plan does not include it.`;

export const simpleVerifierAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: AUTH_DESCRIPTION,
  required: true,
  validate: async ({ auth }) => {
    try {
      await simpleVerifierRequest<MeResponse>({
        apiKey: auth,
        method: HttpMethod.GET,
        path: '/me',
      });
      return { valid: true };
    } catch (e) {
      return {
        valid: false,
        error: e instanceof Error ? e.message : 'Invalid API key',
      };
    }
  },
  getConnectionIdentifier: async ({ auth }) => {
    try {
      const me = await simpleVerifierRequest<MeResponse>({
        apiKey: auth,
        method: HttpMethod.GET,
        path: '/me',
      });
      return me.email;
    } catch {
      return undefined;
    }
  },
});
