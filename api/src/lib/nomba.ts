import axios, { AxiosInstance } from 'axios';
import axiosRetry, { isNetworkError, isRetryableError } from 'axios-retry';
import { env } from '../config/env';
import { logger } from './logger';

export class NombaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'NombaError';
  }
}

function koboToNombaDecimalString(amountKobo: number): string {
  return (amountKobo / 100).toFixed(2);
}

function koboToNombaNumber(amountKobo: number): number {
  return Number(koboToNombaDecimalString(amountKobo));
}

export function nombaAmountToKobo(amount: number | string | null | undefined): number | undefined {
  if (amount === null || amount === undefined || amount === '') return undefined;

  const parsed =
    typeof amount === 'number'
      ? amount
      : Number(String(amount).replace(/,/g, '').trim());

  if (!Number.isFinite(parsed)) return undefined;
  return Math.round(parsed * 100);
}

class NombaClient {
  private http: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor() {
    this.http = axios.create({ baseURL: env.NOMBA_API_BASE_URL, timeout: 30000 });

    // Retry transient failures (network errors + 5xx + 429 + 408).
    // Safe because all Nomba calls carry an idempotency reference (paymentId / payoutId).
    axiosRetry(this.http, {
      retries: 3,
      retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount) + Math.random() * 200,
      retryCondition: (err) =>
        isNetworkError(err) ||
        isRetryableError(err) ||
        err.response?.status === 429 ||
        err.response?.status === 408,
      onRetry: (retryCount, err, config) => {
        logger.warn(
          { retryCount, url: config.url, status: err.response?.status },
          'Retrying Nomba request',
        );
      },
    });
  }

  private isConfigured(): boolean {
    return !!(env.NOMBA_CLIENT_ID && env.NOMBA_PRIVATE_KEY && env.NOMBA_ACCOUNT_ID);
  }

  private requireConfigured(): void {
    if (!this.isConfigured()) {
      throw new NombaError(
        'Nomba credentials not configured (NOMBA_CLIENT_ID / NOMBA_PRIVATE_KEY / NOMBA_ACCOUNT_ID missing)',
        'NOMBA_NOT_CONFIGURED',
        503,
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    // Sandbox credentials must stay on the sandbox host — per Nomba docs, mixing
    // sandbox creds with api.nomba.com (or vice versa) causes auth errors.
    const res = await this.http.post('/auth/token/issue', {
      grant_type: 'client_credentials',
      client_id: env.NOMBA_CLIENT_ID,
      client_secret: env.NOMBA_PRIVATE_KEY,
    }, {
      headers: { accountId: env.NOMBA_ACCOUNT_ID },
    });

    this.accessToken = res.data.data?.access_token ?? res.data.access_token;
    // Response carries an absolute expiry timestamp (expiresAt), not a duration in seconds
    const expiresAt = res.data.data?.expiresAt ?? res.data.expiresAt;
    this.tokenExpiresAt = expiresAt ? new Date(expiresAt).getTime() : Date.now() + 3600_000;

    return this.accessToken!;
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T> {
    this.requireConfigured();
    const token = await this.getAccessToken();
    const startedAt = Date.now();

    try {
      const res = await this.http.request<{ data: T }>({
        method,
        url: path,
        data,
        // accountId header required on every Nomba API call
        headers: {
          Authorization: `Bearer ${token}`,
          accountId: env.NOMBA_ACCOUNT_ID,
          ...extraHeaders,
        },
      });

      const body = res.data as {
        code?: string;
        description?: string;
        message?: string;
        data?: T;
      };
      if (body.code && !['00', '201'].includes(body.code)) {
        throw new NombaError(
          body.description ?? body.message ?? 'Nomba API request failed',
          body.code,
          res.status,
          body,
        );
      }

      logger.debug({ path, method, durationMs: Date.now() - startedAt }, 'Nomba request succeeded');
      return body.data ?? (res.data as T);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? 502;
        const code = err.response?.data?.code ?? 'NOMBA_ERROR';
        const message = err.response?.data?.description ?? err.response?.data?.message ?? err.message;
        logger.error(
          { path, method, status, code, durationMs: Date.now() - startedAt },
          `Nomba API error: ${message}`,
        );
        throw new NombaError(message, code, status, err.response?.data);
      }
      throw err;
    }
  }

  // Nomba checkout body must nest order fields under an "order" key.
  // Response field is "checkoutLink" (not "checkoutUrl").
  async createCheckoutSession(params: {
    amount: number;           // Kobo
    currency: string;
    reference: string;        // becomes orderReference
    callbackUrl: string;
    customerEmail?: string;
    customerId?: string;
  }): Promise<{ checkoutUrl: string; reference: string }> {
    const raw = await this.request<{ checkoutLink?: string; orderReference?: string }>(
      'post',
      '/checkout/order',
      {
        order: {
          orderReference: params.reference,
          amount: koboToNombaNumber(params.amount),
          currency: params.currency,
          callbackUrl: params.callbackUrl,
          ...(params.customerEmail ? { customerEmail: params.customerEmail } : {}),
          ...(params.customerId ? { customerId: params.customerId } : {}),
        },
      },
    );
    return {
      checkoutUrl: raw.checkoutLink ?? '',
      reference: raw.orderReference ?? params.reference,
    };
  }

  // POST /direct-debits/debit-mandate — response has no per-attempt transaction
  // reference, only mandateId/status/amount/message. Caller must self-reference
  // by payment.id for later webhook reconciliation.
  async initiateDirectDebit(params: {
    mandateId: string;
    amount: number;           // Kobo
  }): Promise<{ mandateId: string; status: string; amount: string; message?: string }> {
    return this.request('post', '/direct-debits/debit-mandate', {
      mandateId: params.mandateId,
      amount: koboToNombaDecimalString(params.amount),
    });
  }

  // POST /direct-debits — requires the customer's bank account details directly;
  // there is no hosted consent-URL flow. Returns { mandateId, merchantReference, phoneNumber, description }.
  async createMandate(params: {
    customerAccountNumber: string;
    bankCode: string;
    customerName: string;
    customerAccountName: string;
    amount: number;            // Kobo
    frequency: string;
    merchantReference: string; // numeric, unique
    startDate: string;
    endDate: string;
    customerEmail: string;
    customerAddress?: string;
    customerPhoneNumber?: string;
    narration?: string;
    startImmediately?: boolean;
  }): Promise<{ mandateId: string; merchantReference: string; phoneNumber?: string; description?: string }> {
    return this.request('post', '/direct-debits', {
      ...params,
      amount: koboToNombaNumber(params.amount),
    });
  }

  // PUT /direct-debits/update-status — status is uppercase: SUSPEND | ACTIVE | DELETE
  async updateMandateStatus(providerMandateId: string, status: 'SUSPEND' | 'ACTIVE' | 'DELETE'): Promise<void> {
    await this.request('put', '/direct-debits/update-status', {
      mandateId: providerMandateId,
      status,
    });
  }

  async cancelMandate(providerMandateId: string): Promise<void> {
    await this.updateMandateStatus(providerMandateId, 'DELETE');
  }

  // POST /transfers/bank/lookup — dedicated NUBAN-to-name resolution endpoint
  async accountNameEnquiry(params: {
    accountNumber: string;
    bankCode: string;
  }): Promise<{ accountName: string; accountNumber: string }> {
    return this.request('post', '/transfers/bank/lookup', params);
  }

  // POST /v2/transfers/bank/{subAccountId} — a different API version than the
  // rest of this client, and the sub-account ID is a URL path segment, not a
  // body field. Pass an absolute URL so it bypasses the /v1-scoped baseURL.
  async initiateTransfer(params: {
    accountNumber: string;
    bankCode: string;
    accountName: string;      // resolved via accountNameEnquiry immediately before transfer
    senderName?: string;
    amount: number;           // Kobo
    narration?: string;
    merchantTxRef: string;    // payoutId — Nomba idempotency key
  }): Promise<{ id: string; status: string }> {
    const origin = new URL(env.NOMBA_API_BASE_URL).origin;
    return this.request(
      'post',
      `${origin}/v2/transfers/bank/${env.NOMBA_SUB_ACCOUNT_ID}`,
      {
        ...params,
        amount: koboToNombaNumber(params.amount),
      },
      { 'X-Idempotent-key': params.merchantTxRef },
    );
  }

  async verifyTransaction(params: {
    orderReference?: string;
    transactionRef?: string;
  }): Promise<{ status?: string; id?: string; onlineCheckoutOrderReference?: string }> {
    const query = new URLSearchParams();

    if (params.orderReference) query.set('orderReference', params.orderReference);
    if (!params.orderReference && params.transactionRef) query.set('transactionRef', params.transactionRef);

    if ([...query.keys()].length === 0) {
      throw new NombaError(
        'Either orderReference or transactionRef is required to verify a transaction',
        'NOMBA_VERIFY_REFERENCE_REQUIRED',
        400,
      );
    }

    return this.request('get', `/transactions/accounts/single?${query.toString()}`);
  }

  // Nomba signs a constructed string, not the raw body:
  // "{event_type}:{requestId}:{userId}:{walletId}:{transactionId}:{type}:{time}:{responseCode}:{nomba-timestamp}"
  // HMAC-SHA256, base64-encoded. Confirmed by the official webhook reference doc.
  verifyWebhookSignature(
    payload: {
      event_type?: string;
      data?: {
        merchant?: { userId?: string; walletId?: string };
        transaction?: { transactionId?: string; type?: string; time?: string; responseCode?: string };
      };
      requestId?: string;
    },
    timestamp: string,
    signatureHeader: string,
  ): boolean {
    if (!env.NOMBA_WEBHOOK_SECRET || !signatureHeader || !timestamp) return false;
    const crypto = require('node:crypto');

    const merchant = payload.data?.merchant;
    const transaction = payload.data?.transaction;
    const responseCode = transaction?.responseCode === 'null' ? '' : (transaction?.responseCode ?? '');

    const hashingPayload = [
      payload.event_type ?? '',
      payload.requestId ?? '',
      merchant?.userId ?? '',
      merchant?.walletId ?? '',
      transaction?.transactionId ?? '',
      transaction?.type ?? '',
      transaction?.time ?? '',
      responseCode,
      timestamp,
    ].join(':');

    const expected = crypto
      .createHmac('sha256', env.NOMBA_WEBHOOK_SECRET)
      .update(hashingPayload)
      .digest('base64');

    const expectedBuf = Buffer.from(expected);
    const givenBuf = Buffer.from(signatureHeader);
    if (expectedBuf.length !== givenBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, givenBuf);
  }
}

export const nombaClient = new NombaClient();
