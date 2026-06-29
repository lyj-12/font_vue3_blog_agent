// ============================================================
// API Layer — real HTTP for auth + blog + categories
// ============================================================

import { clearTokens, decodeJwtPayload, http, saveTokens } from './client'

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
  async login(username: string, password: string): Promise<{ user: User, tokens: TokenResponse }> {
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
      if (!raw)
        return null
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
      categories: Array<{ id: number, cate_name: string, created_at: string }>
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
      categories: Array<{ id: number, cate_name: string, created_at: string }>
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

  async create(data: { title: string, content: string, categoryIds: number[] }): Promise<BlogDetail> {
    const p = await http.post<{
      id: number
      title: string
      content: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number, cate_name: string, created_at: string }>
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

  async update(id: number, data: { title: string, content: string, categoryIds: number[] }): Promise<BlogDetail> {
    const p = await http.put<{
      id: number
      title: string
      content: string
      views: number
      created_at: string
      updated_at: string
      user_id: number
      categories: Array<{ id: number, cate_name: string, created_at: string }>
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
    return http.get<Array<{ id: number, cate_name: string, created_at: string }>>('/blog-categories')
      .then(cats => cats.map(c => ({ id: c.id, name: c.cate_name, createdAt: c.created_at })))
  },

  async create(name: string): Promise<Category> {
    const c = await http.post<{ id: number, cate_name: string, created_at: string }>('/blog-categories', { cate_name: name })
    return { id: c.id, name: c.cate_name, createdAt: c.created_at }
  },

  async update(id: number, name: string): Promise<Category> {
    const c = await http.put<{ id: number, cate_name: string, created_at: string }>(`/blog-categories/${id}`, { cate_name: name })
    return { id: c.id, name: c.cate_name, createdAt: c.created_at }
  },

  async delete(id: number): Promise<void> {
    await http.delete(`/blog-categories/${id}`)
  },
}

// --- Word Dict API ---

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
  word?: string | null
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
    return http.put<WordDictItem>(/word-dict/, data)
  },

  async delete(id: number): Promise<void> {
    return http.delete(/word-dict/)
  },
}

export type WordDictResponse = WordDictItem
