import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { validatePhoneAction } from './lib/actions/validate-phone';
import { verifyEmailAction } from './lib/actions/verify-email';
import { simpleVerifierAuth } from './lib/auth';
import { SIMPLEVERIFIER_BASE_URL } from './lib/common/client';

export const simpleverifier = createPiece({
  displayName: 'SimpleVerifier',
  description:
    'Verify email addresses with a live mailbox check and validate phone numbers.',
  auth: simpleVerifierAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://simpleverifier.com/icon.png',
  categories: [PieceCategory.MARKETING, PieceCategory.SALES_AND_CRM],
  authors: ['Ahmedmkarrar'],
  actions: [
    verifyEmailAction,
    validatePhoneAction,
    createCustomApiCallAction({
      baseUrl: () => SIMPLEVERIFIER_BASE_URL,
      auth: simpleVerifierAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth.secret_text}`,
      }),
    }),
  ],
  triggers: [],
});
