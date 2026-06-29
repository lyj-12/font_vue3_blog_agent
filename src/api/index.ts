// ============================================================
// API Layer — real HTTP for auth + blog + categories
// ============================================================

import { http, decodeJwtPayload, saveTokens, clearTokens, BASE_URL } from './client'

// --- Types ---

export interface User {
  id: number
  username: string
  email: string
  avatarUrl: string | null
  createdAt: string
  isActive: boolean
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface Category {
  id: number
  name: string
  createdAt: string
}

export interface BlogListItem {
  id: number
  title: string
  summary: string
  views: number
  createdAt: string
  updatedAt: string
  userId: number
  categories: Category[]
}

export interface BlogDetail {
  id: number
  title: string
  content: string
  views: number
  createdAt: string
  updatedAt: string
  userId: number
  categories: Category[]
}

// --- Auth API ---

export const authApi = {
  async login(username: string, password: string): Promise<{ user: User; tokens: TokenResponse }> {
    const res = await http.post<{
      access_token: string
      refresh_token: string
      token_type: string
    }>('/auth/login', { username, password })

    saveTokens(res.access_token, res.refresh_token)

    const tokens: TokenResponse = {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      tokenType: res.token_type,
    }

    const payload = decodeJwtPayload(res.access_token)
    const user: User = {
      id: payload?.user_id ?? 0,
      username: payload?.sub ?? username,
      email: '',
      avatarUrl: null,
      createdAt: '',
      isActive: true,
    }

    localStorage.setItem('blog_user', JSON.stringify(user))
    return { user, tokens }
  },

  async register(username: string, email: string, password: string): Promise<User> {
    const res = await http.post<{
      id: number
      username: string
      email: string
      avatar_url: string | null
      created_at: string
      is_active: boolean
    }>('/auth/register', { username, password, email })

    const user: User = {
      id: res.id,
      username: res.username,
      email: res.email,
      avatarUrl: res.avatar_url,
      createdAt: res.created_at,
      isActive: res.is_active,
    }

    localStorage.setItem('blog_user', JSON.stringify(user))
    return user
  },

  async logout(): Promise<void> {
    clearTokens()
    localStorage.removeItem('blog_user')
  },

  async getSession(): Promise<User | null> {
    try {
      const raw = localStorage.getItem('blog_user')
      if (!raw) return null
      return JSON.parse(raw) as User
    }
    catch {
      return null
    }
  },
}

// --- Blog API ---

export const blogApi = {
  async list(): Promise<BlogListItem[]> {
    return http.get<Array<{
      id: number
      title: string
      summary: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number; cate_name: string; created_at: string }>
    }>>('/blogs').then(posts => posts.map(p => ({
      id: p.id,
      title: p.title,
      summary: p.summary || '',
      views: p.views,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      userId: p.user_id,
      categories: p.categories.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })),
    })))
  },

  async getById(id: number): Promise<BlogDetail> {
    const p = await http.get<{
      id: number
      title: string
      content: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number; cate_name: string; created_at: string }>
    }>(`/blogs/${id}`)
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      views: p.views,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      userId: p.user_id,
      categories: p.categories.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })),
    }
  },

  async create(data: { title: string; content: string; categoryIds: number[] }): Promise<BlogDetail> {
    const p = await http.post<{
      id: number
      title: string
      content: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number; cate_name: string; created_at: string }>
    }>('/blogs', { title: data.title, content: data.content, category_ids: data.categoryIds })
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      views: p.views,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      userId: p.user_id,
      categories: p.categories.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })),
    }
  },

  async update(id: number, data: { title: string; content: string; categoryIds: number[] }): Promise<BlogDetail> {
    const p = await http.put<{
      id: number
      title: string
      content: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number; cate_name: string; created_at: string }>
    }>(`/blogs/${id}`, { title: data.title, content: data.content, category_ids: data.categoryIds })
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      views: p.views,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      userId: p.user_id,
      categories: p.categories.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })),
    }
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/blogs/${id}`)
  },
}

// --- Category API ---

export const categoryApi = {
  async list(): Promise<Category[]> {
    return http.get<Array<{ id: number; cate_name: string; created_at: string }>>('/blog-categories')
      .then(cats => cats.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })))
  },

  async create(name: string): Promise<Category> {
    const c = await http.post<{ id: number; cate_name: string; created_at: string }>('/blog-categories', { cate_name: name })
    return { id: c.id, name: c.cate_name, createdAt: c.created_at }
  },

  async update(id: number, name: string): Promise<Category> {
    const c = await http.put<{ id: number; cate_name: string; created_at: string }>(`/blog-categories/${id}`, { cate_name: name })
    return { id: c.id, name: c.cate_name, createdAt: c.created_at }
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/blog-categories/${id}`)
  },
}

// --- Knowledge / RAG Chat API ---

export interface SourceDoc {
  content: string
  score: number
  metadata: Record<string, any>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatCallbacks {
  onToken: (token: string) => void
  onContext?: (sources: SourceDoc[]) => void
  onError?: (error: string) => void
  onDone?: () => void
}

// KNOWLEDGE_BASE_URL removed - use imported BASE_URL instead

export const knowledgeApi = {
  chat(
    query: string,
    sessionId: number,
    history: ChatMessage[],
    callbacks: ChatCallbacks,
  ): AbortController {
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`${BASE_URL}/knowledge/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, session_id: sessionId }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const err = await res.text().catch(() => 'Unknown error')
          callbacks.onError?.(`Request failed (${res.status}): ${err}`)
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          callbacks.onError?.('Response body is not readable')
          return
        }


        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const payload = trimmed.slice(6).trim()

            if (payload === '[DONE]') {
              callbacks.onDone?.()
              return
            }

            try {
              const data = JSON.parse(payload)
              switch (data.type) {
                case 'token':
                  callbacks.onToken(data.content)
                  break
                case 'context':
                  callbacks.onContext?.(data.sources)
                  break
                case 'error':
                  callbacks.onError?.(data.content)
                  break
              }
            }
            catch {
              // Skip unparseable lines
            }
          }
        }
        callbacks.onDone?.()
      }
      catch (err: any) {
        if (err.name === 'AbortError') return
        callbacks.onError?.(err.message || 'Network error')
      }
    })()

    return controller
  },
}

export interface SessionItem {
  id: number
  title: string
  message_count: number
  last_message: string | null
  created_at: string
  updated_at: string
}

export interface MessageItem {
  id: number
  session_id: number
  role: string
  content: string
  sources: string | null
  created_at: string
}

export const sessionApi = {
  async list(): Promise<SessionItem[]> {
    return http.get<SessionItem[]>('/knowledge/sessions')
  },

  async create(title: string = "新对话"): Promise<SessionItem> {
    return http.post<SessionItem>('/knowledge/sessions', { title })
  },

  async update(id: number, title: string): Promise<SessionItem> {
    return http.put<SessionItem>(`/knowledge/sessions/${id}`, { title })
  },

  async delete(id: number): Promise<void> {
    return http.delete(`/knowledge/sessions/${id}`)
  },

  async messages(id: number): Promise<MessageItem[]> {
    return http.get<MessageItem[]>(`/knowledge/sessions/${id}/messages`)
  },
}

// --- Word Dictionary API ---

export interface WordDictItem {
  id: number
  user_id: number | null
  word_detail: string | null
  chapter: string | null
  word_uk: string | null
  word_sourceUrl: string | null
  remark: string | null
}

export interface WordDictCreatePayload {
  word: string
  chapter?: string | null
  remark?: string | null
}

export interface WordDictUpdatePayload {
  chapter?: string | null
  remark?: string | null
}

export const wordDictApi = {
  async list(): Promise<WordDictItem[]> {
    return http.get<WordDictItem[]>('/word-dict')
  },

  async create(data: WordDictCreatePayload): Promise<WordDictItem> {
    return http.post<WordDictItem>('/word-dict', data)
  },

  async update(id: number, data: WordDictUpdatePayload): Promise<WordDictItem> {
    return http.put<WordDictItem>(`/word-dict/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return http.delete(`/word-dict/${id}`)
  },
}

export type WordDictResponse = WordDictItem
