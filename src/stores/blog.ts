import { acceptHMRUpdate, defineStore } from 'pinia'
import type { BlogListItem, BlogDetail, Category } from '~/api'
import { blogApi, categoryApi } from '~/api'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogListItem[]>([])
  const currentPost = ref<BlogDetail | null>(null)
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Search/filter state (client-side since backend doesn't support search yet)
  const searchQuery = ref('')
  const selectedCategoryId = ref<number | null>(null)
  const sortField = ref<"title" | "createdAt" | "updatedAt">("createdAt")
  const sortOrder = ref<"asc" | "desc">("desc")

  // Computed: posts filtered by search + category
  const filteredPosts = computed(() => {
    let result = posts.value
    if (selectedCategoryId.value) {
      result = result.filter(p => p.categories.some(c => c.id === selectedCategoryId.value))
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(q))
    }
    // Sort
    return [...result].sort((a, b) => {
      let cmp: number
      if (sortField.value === "title")
        cmp = a.title.localeCompare(b.title)
      else if (sortField.value === "createdAt")
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortOrder.value === "asc" ? cmp : -cmp
    })
  })

  // ---- Blog actions ----

  async function fetchPosts() {
    loading.value = true
    error.value = null
    try {
      posts.value = await blogApi.list()
    }
    catch (e: any) {
      error.value = e.message || 'Failed to fetch posts'
      posts.value = []
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPost(id: number) {
    loading.value = true
    error.value = null
    try {
      currentPost.value = await blogApi.getById(id)
    }
    catch (e: any) {
      error.value = e.message || 'Failed to fetch post'
      currentPost.value = null
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function createPost(data: { title: string; content: string; categoryIds: number[] }) {
    loading.value = true
    error.value = null
    try {
      const post = await blogApi.create(data)
      await fetchPosts()
      return post
    }
    catch (e: any) {
      error.value = e.message || 'Failed to create post'
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function updatePost(id: number, data: { title: string; content: string; categoryIds: number[] }) {
    loading.value = true
    error.value = null
    try {
      const updated = await blogApi.update(id, data)
      if (currentPost.value?.id === id) {
        currentPost.value = updated
      }
      await fetchPosts()
      return updated
    }
    catch (e: any) {
      error.value = e.message || 'Failed to update post'
      throw e
    }
    finally {
      loading.value = false
    }
  }

  async function deletePost(id: number) {
    loading.value = true
    error.value = null
    try {
      await blogApi.delete(id)
      if (currentPost.value?.id === id) {
        currentPost.value = null
      }
      await fetchPosts()
    }
    catch (e: any) {
      error.value = e.message || 'Failed to delete post'
      throw e
    }
    finally {
      loading.value = false
    }
  }

  // ---- Category actions ----

  async function fetchCategories() {
    try {
      categories.value = await categoryApi.list()
    }
    catch (e: any) {
      error.value = e.message || 'Failed to fetch categories'
    }
  }

  async function createCategory(name: string) {
    try {
      const cat = await categoryApi.create(name)
      categories.value.push(cat)
      return cat
    }
    catch (e: any) {
      error.value = e.message || 'Failed to create category'
      throw e
    }
  }
  async function updateCategory(id: number, name: string) {
    try {
      const updated = await categoryApi.update(id, name)
      const idx = categories.value.findIndex(c => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      return updated
    }
    catch (e: any) {
      error.value = e.message || 'Failed to update category'
      throw e
    }
  }
  async function deleteCategory(id: number) {
    try {
      await categoryApi.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
    }
    catch (e: any) {
      error.value = e.message || 'Failed to delete category'
      throw e
    }
  }

  return {
    posts,
    currentPost,
    categories,
    loading,
    error,
    searchQuery,
    selectedCategoryId,
    sortField,
    sortOrder,
    filteredPosts,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useBlogStore as any, import.meta.hot))
