import { createRedsysAPI, PRODUCTION_URLS, SANDBOX_URLS } from 'redsys-easy';

const isProduction = process.env.REDSYS_ENV === 'production';

export function getRedsysApi() {
  const secretKey = process.env.REDSYS_SECRET_KEY;
  if (!secretKey) {
    throw new Error('REDSYS_SECRET_KEY no está configurada');
  }
  return createRedsysAPI({
    secretKey,
    urls: isProduction ? PRODUCTION_URLS : SANDBOX_URLS,
  });
}

export const redsysMerchantCode = process.env.REDSYS_MERCHANT_CODE || '';
export const redsysTerminal = process.env.REDSYS_TERMINAL || '1';
export const redsysMerchantName =
  process.env.REDSYS_MERCHANT_NAME || 'Control Play Sports';

