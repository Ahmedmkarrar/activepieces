import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { simpleVerifierAuth } from '../auth';
import { simpleVerifierRequest } from '../common/client';

export const verifyEmailAction = createAction({
  auth: simpleVerifierAuth,
  name: 'verify_email',
  classification: 'READ',
  displayName: 'Verify Email Address',
  description:
    'Checks syntax, domain, disposable provider and the mailbox itself (live SMTP check). Returns valid, risky or invalid with a reason.',
  audience: 'both',
  aiMetadata: {
    description:
      'Verify one email address with SimpleVerifier: syntax, domain, disposable-provider and live mailbox (SMTP) checks, returning status (valid, risky or invalid), a reason, and an action field (send, send_with_care, retry_later or do_not_send) to branch on. Use before sending to or storing an address; for phone numbers use Validate Phone Number instead. Nothing is sent to the address; each call counts as one API call on the plan, and re-checking the same address is safe.',
    idempotent: true,
  },
  props: {
    email: Property.ShortText({
      displayName: 'Email',
      description:
        'The address to check. Only "valid" means the mail server confirmed the mailbox exists.',
      required: true,
    }),
  },
  async run(context) {
    return await simpleVerifierRequest<Record<string, unknown>>({
      apiKey: context.auth.secret_text,
      method: HttpMethod.POST,
      path: '/verify',
      body: { email: context.propsValue.email.trim() },
    });
  },
});
