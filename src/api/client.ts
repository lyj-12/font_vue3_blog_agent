// ============================================================
// HTTP Client — wraps fetch with base URL, auth headers, etc.
// ============================================================

const BASE_URL = 'http://localhost:8008/api'

function getTokens(): { accessToken: string | null, refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('blog_tokens')
    if (!raw)
      return { accessToken: null, refreshToken: null }
    return JSON.parse(raw)
  }
  catch {
    return { accessToken: null, refreshToken: null }
  }
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('blog_tokens', JSON.stringify({ accessToken, refreshToken }))
}

export function clearTokens() {
  localStorage.removeItem('blog_tokens')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const { accessToken } = getTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // On 401, clear tokens so user can re-login
    if (res.status === 401) {
      clearTokens()
      localStorage.removeItem('blog_user')
      localStorage.setItem('blog_auth_expired', '1')
    }
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      detail = body.detail || body.message || detail
    }
    catch {
      // ignore parse error
    }
    throw new Error(detail)
  }

  return res.json()
}

export const http = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' })
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}

// Simple JWT payload decoder (no verification — server handles that)
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3)
      return null
    const payload = parts[1]
    // Handle base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  }
  catch {
    return null
  }
}
