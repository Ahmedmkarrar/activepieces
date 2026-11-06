import {
  httpClient,
  HttpError,
  HttpMethod,
  HttpRequest,
} from '@activepieces/pieces-common';

export const SIMPLEVERIFIER_BASE_URL = 'https://simpleverifier.com/api/v1';

const REQUEST_TIMEOUT_MS = 30000;

const STATUS_MESSAGES: Record<number, string> = {
  400: 'SimpleVerifier rejected the request: the email or phone parameter is missing.',
  401: 'Your SimpleVerifier API key was not accepted. Create one at https://simpleverifier.com/api-keys (it starts with sv_live_).',
  402: 'This SimpleVerifier subscription is not active or has used its included calls for the month. API access comes with the Pro, Business and Agency plans: https://simpleverifier.com/pricing',
  429: 'SimpleVerifier rate limit reached (120 calls a minute per key). Wait and try again.',
  503: 'The SimpleVerifier verification service is briefly unavailable. Try again shortly.',
};

function extractErrorMessage(body: unknown): string | undefined {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const value = (body as { error: unknown }).error;
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

export async function simpleVerifierRequest<T>({
  apiKey,
  method,
  path,
  body,
}: {
  apiKey: string;
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
}): Promise<T> {
  const request: HttpRequest = {
    method,
    url: `${SIMPLEVERIFIER_BASE_URL}${path}`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
    timeout: REQUEST_TIMEOUT_MS,
  };

  try {
    const response = await httpClient.sendRequest<T>(request);
    return response.body;
  } catch (e) {
    if (!(e instanceof HttpError)) {
      throw e;
    }
    const status = e.response.status;
    const apiMessage = extractErrorMessage(e.response.body);
    const known = STATUS_MESSAGES[status];
    if (!known && !apiMessage) {
      throw e;
    }
    const parts = [known, apiMessage].filter((part) => part !== undefined);
    throw new Error(`${parts.join(' ')} (HTTP ${status})`);
  }
}
