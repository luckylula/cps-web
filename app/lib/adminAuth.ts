import { NextResponse } from 'next/server';

function credentialsMatch(value: string | null | undefined): boolean {
  if (!value) return false;

  const candidates = [
    process.env.ADMIN_PANEL_PASSWORD,
    process.env.ADMIN_API_TOKEN,
    process.env.ADMIN_API_KEY,
  ].filter((v): v is string => Boolean(v && v.length > 0));

  return candidates.some((expected) => value === expected);
}

/** Valida Bearer / X-API-Key contra contraseña del panel o tokens admin. */
export function validateAdminAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');

  if (authHeader?.startsWith('Bearer ')) {
    if (credentialsMatch(authHeader.substring(7))) {
      return true;
    }
  }

  if (credentialsMatch(apiKey)) {
    return true;
  }

  return false;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json(
    {
      error:
        'No autorizado. Se requiere una contraseña o token de administración válido.',
    },
    { status: 401 }
  );
}
