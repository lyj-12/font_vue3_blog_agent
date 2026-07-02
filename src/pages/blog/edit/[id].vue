<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import { uploadImage } from '~/api'


const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
  const urls = await Promise.all(
    files.map(file => uploadImage(file)),
  )
  callback(urls)
}
defineOptions({ name: 'BlogEditPage' })

const route = useRoute('/blog/edit/[id]')
const router = useRouter()
const auth = useAuthStore()
const blog = useBlogStore()
const { t } = useI18n()
const toast = ref<{ message: string, type: 'success' | 'error' } | null>(null)

const postId = computed(() => Number(route.params.id))


const form = reactive({
  title: '',
  content: '',
  categoryIds: [] as number[],
})

const submitting = ref(false)
const errorMsg = ref('')
const loaded = ref(false)
const managingCategories = ref(false)
const editingCategoryId = ref<number | null>(null)
const editingCategoryName = ref('')
const confirmDeleteId = ref<number | null>(null)

onMounted(async () => {
  await auth.initSession()

  if (!auth.isLoggedIn) {
    router.replace('/auth/login')
    return
  }

  await blog.fetchCategories()
  try {
    await blog.fetchPost(postId.value)
    const post = blog.currentPost
    if (!post) {
      router.replace('/')
      return
    }
    if (post.userId !== auth.user?.id) {
      router.replace(`/blog/${postId.value}`)
      return
    }
    form.title = post.title
    form.content = post.content
    form.categoryIds = post.categories.map(c => c.id)
    loaded.value = true
  }
  catch {
    router.replace('/auth/login')
  }
})

useHead({
  title: () => `${t('blog.edit') || 'Edit'}: ${form.title || 'Post'}`,
})

function toggleCategory(id: number) {
  if (managingCategories.value)
    return
  const idx = form.categoryIds.indexOf(id)
  if (idx === -1)
    form.categoryIds.push(id)
  else
    form.categoryIds.splice(idx, 1)
}

async function handleSave() {
  if (!form.title.trim()) {
    errorMsg.value = 'Title is required'
    return
  }
  if (!form.content.trim()) {
    errorMsg.value = 'Content is required'
    return
  }

  submitting.value = true
  errorMsg.value = ''
  try {
    await blog.updatePost(postId.value, {
      title: form.title.trim(),
      content: form.content,
      categoryIds: form.categoryIds,
    })
    router.push(`/blog/${postId.value}`)
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Failed to update post'
  }
  finally {
    submitting.value = false
  }
}

// ---- Category management ----

function handleStartRename(cat: { id: number, name: string }) {
  editingCategoryId.value = cat.id
  editingCategoryName.value = cat.name
}

function handleCancelRename() {
  editingCategoryId.value = null
  editingCategoryName.value = ''
}

async function handleSaveRename() {
  const id = editingCategoryId.value
  const name = editingCategoryName.value.trim()
  if (!id || !name)
    return
  try {
    await blog.updateCategory(id, name)
    editingCategoryId.value = null
    editingCategoryName.value = ''
    toast.value = { message: `Renamed to "${name}"`, type: 'success' }
    setTimeout(() => {
      toast.value = null
    }, 3000)
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Failed to rename category'
  }
}

function handleStartDelete(id: number) {
  confirmDeleteId.value = id
}

function handleCancelDelete() {
  confirmDeleteId.value = null
}

async function handleDeleteCategory(id: number) {
  try {
    await blog.deleteCategory(id)
    const idx = form.categoryIds.indexOf(id)
    if (idx !== -1)
      form.categoryIds.splice(idx, 1)
    confirmDeleteId.value = null
    toast.value = { message: 'Category deleted', type: 'success' }
    setTimeout(() => {
      toast.value = null
    }, 3000)
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Failed to delete category'
  }
}
</script>

<template>
  <div mx-auto max-w-6xl py-3>
    <div v-if="!loaded" flex justify-center py-20>
      <div i-carbon-circle-dash animate-spin text-3xl text-teal-600 />
    </div>

    <template v-else>
      <div v-if="errorMsg" mb-4 rounded-lg p-3 text-sm bg="red-50 dark:red-900/30" text="red-600 dark:red-400" border="~ red-200 dark:red-800">
        {{ errorMsg }}
      </div>

      <div
        v-if="toast" mb-4 rounded-lg p-3 text-sm transition-opacity :class="toast.type === 'success'
          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
          : 'bg-red-50 dark:red-900/30 text-red-600 dark:red-400 border border-red-200 dark:border-red-800'"
      >
        {{ toast.message }}
      </div>

      <div mb-4>
        <input v-model="form.title" type="text" w-full p="x-0 y-3" text="3xl gray-800 dark:gray-100" bg="transparent" border="none" outline="none" font-bold :placeholder="t('blog.title_placeholder') || 'Post title...'">
      </div>

      <!-- Categories + Save -->
      <div mb-6 flex flex-wrap items-end gap-4>
        <div flex flex-wrap items-center gap-2>
          <label text="sm gray-600 dark:gray-400" whitespace-nowrap>{{ t('blog.category') || 'Categories:' }}</label>

          <!-- Normal mode: category pills -->
          <template v-if="!managingCategories">
            <button
              v-for="cat in blog.categories"
              :key="cat.id"
              border="~" cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors
              :class="form.categoryIds.includes(cat.id)
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
              @click="toggleCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          </template>

          <!-- Manage mode: rename / delete -->
          <template v-else>
            <div
              v-for="cat in blog.categories"
              v-show="confirmDeleteId !== cat.id"
              :key="cat.id"
              flex items-center gap-1 rounded-full border="~ gray-200 dark:gray-600" bg="gray-100 dark:gray-700" px-3 py-1.5 text-xs
            >
              <template v-if="editingCategoryId === cat.id">
                <input
                  v-model="editingCategoryName"
                  type="text"
                  autofocus
                  w-24 bg="transparent" text="gray-800 dark:gray-100" outline="none"
                  @keydown.enter="handleSaveRename"
                  @keydown.escape="handleCancelRename"
                  @blur="handleSaveRename"
                >
              </template>
              <template v-else>
                <span text="gray-600 dark:gray-400" cursor-pointer hover="text-teal-600 dark:text-teal-400" @click="handleStartRename(cat)">{{ cat.name }}</span>
                <button cursor-pointer text="gray-400 hover:red-500" p-0.5 :title="t('blog.delete') || 'Delete'" @click="handleStartDelete(cat.id)">
                  <div i-carbon-trash-can inline-block />
                </button>
              </template>
            </div>

            <div
              v-for="cat in blog.categories"
              v-show="confirmDeleteId === cat.id"
              :key="`confirm-${cat.id}`"
              flex items-center gap-1 rounded-full border="~ red-300 dark:red-700" bg="red-50 dark:red-900/30" px-3 py-1 text-xs
            >
              <span text="red-600 dark:red-400" whitespace-nowrap>Delete "{{ cat.name }}"?</span>
              <button cursor-pointer text="red-600 dark:red-400 font-medium hover:text-red-700" @click="handleDeleteCategory(cat.id)">
                {{ t('button.go') || 'Yes' }}
              </button>
              <button cursor-pointer text="gray-500 dark:gray-400 hover:text-gray-700" @click="handleCancelDelete">
                {{ t('blog.cancel') || 'Cancel' }}
              </button>
            </div>
          </template>

          <button
            cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium
            :class="managingCategories
              ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 border border-teal-300 dark:border-teal-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-dashed gray-300 dark:gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="managingCategories = !managingCategories"
          >
            <div i-carbon-settings-adjust mr-0.5 inline-block />{{ managingCategories ? (t('blog.done') || 'Done') : (t('blog.manage') || 'Manage') }}
          </button>
        </div>

        <button btn flex items-center gap-1.5 px-6 py-2 text-sm :disabled="submitting" @click="handleSave">
          <span v-if="submitting" flex items-center gap-1><div i-carbon-circle-dash animate-spin />{{ t('blog.saving') || 'Saving...' }}</span>
          <span v-else flex items-center gap-1><div i-carbon-save />{{ t('blog.save') || 'Save Changes' }}</span>
        </button>
      </div>

      <div>
        <!-- <label text="sm gray-600 dark:gray-400" mb-2 block>{{ t('blog.content') || 'Content (Markdown):' }}</label> -->
        <MdEditor v-model="form.content" @onUploadImg="onUploadImg" min-h-screen-sm :theme="isDark ? 'dark' : 'light'" language="en-US" />
      </div>
    </template>
  </div>
</template>

