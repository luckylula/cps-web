/**
 * Redsys payment gateway configuration and helpers.
 * Uses env vars: REDSYS_MERCHANT_CODE, REDSYS_TERMINAL, REDSYS_SECRET_KEY, REDSYS_ENV (sandbox|production)
 */
import {
  createRedsysAPI,
  SANDBOX_URLS,
  PRODUCTION_URLS,
  randomTransactionId,
} from 'redsys-easy';

function getRedsysConfig() {
  const merchantCode = process.env.REDSYS_MERCHANT_CODE || '';
  const terminal = process.env.REDSYS_TERMINAL || '001';
  const secretKey = process.env.REDSYS_SECRET_KEY || '';
  const env = process.env.REDSYS_ENV || 'sandbox';
  const urls = env === 'production' ? PRODUCTION_URLS : SANDBOX_URLS;

  return { merchantCode, terminal, secretKey, urls };
}

export function isRedsysConfigured(): boolean {
  const { merchantCode, secretKey } = getRedsysConfig();
  return !!(merchantCode && secretKey);
}

export function getRedsysAPI() {
  const { secretKey, urls } = getRedsysConfig();
  return createRedsysAPI({
    secretKey,
    urls,
  });
}

export function generateRedsysOrderId(): string {
  return randomTransactionId();
}

export { getRedsysConfig };
