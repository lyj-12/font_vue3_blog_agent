import { acceptHMRUpdate, defineStore } from 'pinia'
import type { User, TokenResponse } from '~/api'
import { authApi } from '~/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tokens = ref<TokenResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!tokens.value?.accessToken && !!user.value)

  // Restore session on app start
  async function initSession() {
    const saved = await authApi.getSession()
    if (saved) {
      user.value = saved
      // Also try to restore tokens from localStorage
      try {
        const raw = localStorage.getItem('blog_tokens')
        if (raw) tokens.value = JSON.parse(raw)
      }
      catch {
        // ignore
      }
    }
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login(username, password)
      user.value = res.user
      tokens.value = res.tokens
    }
    catch (e: any) {
      error.value = e.message || 'Login failed'
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function register(username: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      // Register first
      const newUser = await authApi.register(username, email, password)
      // Then login to get tokens
      const loginRes = await authApi.login(username, password)
      user.value = newUser
      tokens.value = loginRes.tokens
    }
    catch (e: any) {
      error.value = e.message || 'Registration failed'
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
    tokens.value = null
  }

  return {
    user,
    tokens,
    loading,
    error,
    isLoggedIn,
    initSession,
    login,
    register,
    logout,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore as any, import.meta.hot))
