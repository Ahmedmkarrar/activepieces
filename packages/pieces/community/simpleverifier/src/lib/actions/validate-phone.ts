import { HttpMethod } from '@activepieces/pieces-common';
import { createAction, Property } from '@activepieces/pieces-framework';
import { simpleVerifierAuth } from '../auth';
import { simpleVerifierRequest } from '../common/client';

export const validatePhoneAction = createAction({
  auth: simpleVerifierAuth,
  name: 'validate_phone',
  classification: 'READ',
  displayName: 'Validate Phone Number',
  description:
    'Format, E.164 form, country and numbering-plan line type. Does not say whether a number is in service.',
  audience: 'both',
  aiMetadata: {
    description:
      'Validate and normalise one phone number with SimpleVerifier: returns phone_status, the E.164 form, country and numbering-plan type, plus carrier and line type when a live carrier lookup runs. Use for phone numbers; for email addresses use Verify Email Address instead. It cannot confirm a number is in service; each call counts as one API call and is safe to repeat.',
    idempotent: true,
  },
  props: {
    phone: Property.ShortText({
      displayName: 'Phone Number',
      description: 'The number to check, for example +44 7911 123456.',
      required: true,
    }),
    country: Property.ShortText({
      displayName: 'Country',
      description:
        'Two-letter country code used for numbers written without a leading +',
      required: false,
      defaultValue: 'US',
    }),
    live: Property.Checkbox({
      displayName: 'Live Carrier Lookup',
      description:
        'Whether to run a live carrier lookup on valid numbers. Lookups need live phone lookups on your account; without them you get the free numbering-plan check.',
      required: false,
      defaultValue: true,
    }),
  },
  async run(context) {
    const { phone, country, live } = context.propsValue;
    const countryCode = country?.trim();
    return await simpleVerifierRequest<Record<string, unknown>>({
      apiKey: context.auth.secret_text,
      method: HttpMethod.POST,
      path: '/phone',
      body: {
        phone: phone.trim(),
        ...(countryCode ? { country: countryCode.toUpperCase() } : {}),
        live: live ?? true,
      },
    });
  },
});
