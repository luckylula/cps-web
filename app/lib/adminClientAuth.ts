const STORAGE_KEY = 'cps_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(STORAGE_KEY, token.trim());
}

export function clearAdminToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function adminAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
