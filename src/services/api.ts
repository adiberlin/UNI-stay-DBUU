// ============================================================
// src/services/api.ts — HTTP Client with Token Injection
// ============================================================

const TOKEN_KEY = 'dbuu_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !token.startsWith('mock_token_')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = endpoint.startsWith('http') ? endpoint : `${cleanBase}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if the response is actually JSON (avoid HTML index.html fallback)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new ApiError('Endpoint returned non-JSON response (possibly static host fallback)', response.status);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network error. Please ensure the server is running.', 0);
  }
}
