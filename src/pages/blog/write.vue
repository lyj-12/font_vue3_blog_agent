<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'

defineOptions({ name: 'BlogWritePage' })

const router = useRouter()
const auth = useAuthStore()
const blog = useBlogStore()
const { t } = useI18n()

useHead({ title: () => t('blog.write') || 'Write a Post' })

if (!auth.isLoggedIn) {
  router.replace('/auth/login')
}
const form = reactive({
  title: '',
  content: '',
  categoryIds: [] as number[],
})

const submitting = ref(false)
const errorMsg = ref('')
const showNewCategory = ref(false)
const newCategoryName = ref('')

onMounted(async () => {
  await blog.fetchCategories()
})

function toggleCategory(id: number) {
  const idx = form.categoryIds.indexOf(id)
  if (idx === -1) {
    form.categoryIds.push(id)
  }
  else {
    form.categoryIds.splice(idx, 1)
  }
}

async function handleCreateCategory() {
  const name = newCategoryName.value.trim()
  if (!name)
    return
  try {
    const cat = await blog.createCategory(name)
    form.categoryIds.push(cat.id)
    newCategoryName.value = ''
    showNewCategory.value = false
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Failed to create category'
  }
}

async function handlePublish() {
  if (!form.title.trim()) { errorMsg.value = 'Title is required'; return }
  if (!form.content.trim()) { errorMsg.value = 'Content is required'; return }

  submitting.value = true
  errorMsg.value = ''
  try {
    const post = await blog.createPost({
      title: form.title.trim(),
      content: form.content,
      categoryIds: form.categoryIds,
    })
    router.push(`/blog/${post.id}`)
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Failed to publish post'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div mx-auto max-w-6xl py-6>
    <div v-if="errorMsg" mb-4 rounded-lg p-3 text-sm bg="red-50 dark:red-900/30" text="red-600 dark:red-400" border="~ red-200 dark:red-800">
      {{ errorMsg }}
    </div>

    <div mb-4>
      <input v-model="form.title" type="text" w-full p="x-0 y-3" text="3xl gray-800 dark:gray-100" bg="transparent" border="none" outline="none" font-bold :placeholder="t('blog.title_placeholder') || 'Post title...'">
    </div>

    <!-- Categories + Publish -->
    <div mb-6 flex flex-wrap items-end gap-4>
      <div flex flex-wrap items-center gap-2>
        <label text="sm gray-600 dark:gray-400" whitespace-nowrap>{{ t('blog.category') || 'Categories:' }}</label>
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
        <button
          cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium
          bg="gray-100 dark:gray-700" text="gray-500 dark:gray-400"
          border="~ dashed gray-300 dark:gray-600"
          hover="bg-gray-200 dark:bg-gray-600"
          @click="showNewCategory = !showNewCategory"
        >
          <div i-carbon-add mr-0.5 inline-block />{{ t('blog.new_category') || 'New' }}
        </button>
      </div>

      <div v-if="showNewCategory" flex items-center gap-2>
        <input v-model="newCategoryName" type="text" p="x-2 y-1" rounded text-xs bg="gray-50 dark:gray-900" border="~ gray-300 dark:gray-600" outline="none focus:teal-500" placeholder="Category name" @keydown.enter="handleCreateCategory">
        <button btn px-2 py-1 text-xs @click="handleCreateCategory">
          Add
        </button>
      </div>

      <button btn flex items-center gap-1.5 px-6 py-2 text-sm :disabled="submitting" @click="handlePublish">
        <span v-if="submitting" flex items-center gap-1><div i-carbon-circle-dash animate-spin />{{ t('blog.publishing') || 'Publishing...' }}</span>
        <span v-else flex items-center gap-1><div i-carbon-send />{{ t('blog.publish') || 'Publish' }}</span>
      </button>
    </div>

    <div>
      <label text="sm gray-600 dark:gray-400" mb-2 block>{{ t('blog.content') || 'Content (Markdown):' }}</label>
      <MdEditor v-model="form.content" :theme="isDark ? 'dark' : 'light'" :placeholder="t('blog.content_placeholder') || 'Start writing...'" language="en-US" />
    </div>
  </div>
</template>
