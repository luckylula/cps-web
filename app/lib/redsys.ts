import { createRedsysAPI, PRODUCTION_URLS, SANDBOX_URLS } from 'redsys-easy';

/** Leer en cada petición: Next.js puede inlinar process.env a nivel de módulo en el build. */
export function isRedsysProduction(): boolean {
  return process.env.REDSYS_ENV?.trim() === 'production';
}

export function getRedsysRedirectUrl(): string {
  return isRedsysProduction() ? PRODUCTION_URLS.redirect : SANDBOX_URLS.redirect;
}

export function getRedsysApi() {
  const secretKey = process.env.REDSYS_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('REDSYS_SECRET_KEY no está configurada');
  }
  return createRedsysAPI({
    secretKey,
    urls: isRedsysProduction() ? PRODUCTION_URLS : SANDBOX_URLS,
  });
}

export function getRedsysMerchantCode(): string {
  return process.env.REDSYS_MERCHANT_CODE?.trim() || '';
}

export function getRedsysTerminal(): string {
  return process.env.REDSYS_TERMINAL?.trim() || '001';
}

export function getRedsysMerchantName(): string {
  return process.env.REDSYS_MERCHANT_NAME?.trim() || 'CONTROL PLAY SERVICES';
}
