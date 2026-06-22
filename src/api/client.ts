// ============================================================
// HTTP Client — wraps fetch with base URL, auth headers, auto-refresh
// ============================================================

const BASE_URL = 'http://localhost:8008/api'

function getTokens(): { accessToken: string | null, refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('blog_tokens')
    if (!raw) return { accessToken: null, refreshToken: null }
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

// Token refresh — prevent concurrent refresh calls
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const { refreshToken } = getTokens()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false

    const data = await res.json()
    saveTokens(data.access_token, data.refresh_token)
    return true
  }
  catch {
    return false
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const url = `${BASE_URL}${path}`
  const { accessToken } = getTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(url, { ...options, headers })

  // Auto-refresh on 401 (only for authenticated requests, not login/register/refresh itself)
  if (res.status === 401 && accessToken && !isRetry && path !== '/auth/refresh') {
    // Deduplicate concurrent refresh attempts
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => { refreshPromise = null })
    }
    const ok = await refreshPromise
    if (ok) {
      // Retry the original request with new token
      return request<T>(path, options, true)
    }
    // Refresh failed — clear and mark expired
    clearTokens()
    localStorage.removeItem('blog_user')
    localStorage.setItem('blog_auth_expired', '1')
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      detail = body.detail || body.message || detail
    }
    catch { /* ignore */ }
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

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  }
  catch {
    return null
  }
}
