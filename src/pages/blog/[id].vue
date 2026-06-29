<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'

defineOptions({ name: 'BlogDetailPage' })

const route = useRoute('/blog/[id]')
const router = useRouter()
const blog = useBlogStore()
const auth = useAuthStore()
const { t } = useI18n()

const postId = computed(() => Number(route.params.id))

const deleting = ref(false)
const showDeleteConfirm = ref(false)
const showBackToTop = ref(false)

async function loadPost() {
  try {
    await blog.fetchPost(postId.value)
    // Wait for MdPreview to finish rendering markdown
    await nextTick()
    setTimeout(() => {
      initToc()
    }, 100)
  }
  catch {
    router.replace('/')
  }
}

onMounted(loadPost)
watch(postId, () => {
  tocItems.value = []
  activeTocId.value = ''
  loadPost()
})

useHead({
  title: () => blog.currentPost?.title || 'Post',
})

const isAuthor = computed(() =>
  auth.isLoggedIn && blog.currentPost?.userId === auth.user?.id,
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const previewId = 'blog-detail-preview'

// --- Custom TOC ---
interface TocItem {
  id: string
  title: string
  indent: number
  top: number
}

const tocItems = ref<TocItem[]>([])
const activeTocId = ref('')

function initToc() {
  const el = document.getElementById(previewId)
  if (!el)
    return
  const headings = el.querySelectorAll('h1, h2, h3, h4')
  const items: TocItem[] = []
  headings.forEach((h) => {
    const text = h.textContent?.trim()
    if (!text)
      return
    const level = Number(h.tagName[1])
    const id = `toc-${items.length}`
    h.id = id
    items.push({
      id,
      title: text,
      indent: level - 1,
      top: h.getBoundingClientRect().top + window.scrollY - 80,
    })
  })
  tocItems.value = items
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToToc(item: TocItem) {
  const el = document.getElementById(item.id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeTocId.value = item.id
  }
}

// Scroll tracking
let scrollTicking = false
function onScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY + 100
      let active = ''
      for (const item of tocItems.value) {
        if (item.top <= scrollTop)
          active = item.id
      }
      activeTocId.value = active
      showBackToTop.value = window.scrollY > 400
      scrollTicking = false
    })
    scrollTicking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function goToEdit() {
  if (blog.currentPost) {
    router.push(`/blog/edit/${blog.currentPost.id}`)
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await blog.deletePost(postId.value)
    router.replace('/')
  }
  catch {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div>
    <div mx-auto max-w-6xl py-3>
      <!-- Loading -->
      <div v-if="blog.loading && !blog.currentPost" flex justify-center py-20>
        <div i-carbon-circle-dash animate-spin text-3xl text-teal-600 />
      </div>

      <!-- Post content -->
      <template v-else-if="blog.currentPost">
        <div flex gap-8>
          <!-- Main article -->
          <div min-w-0 flex-1>
            <button
              mb-6 flex items-center gap-1 text-sm text="gray-500 hover:gray-700 dark:gray-400 dark:hover:gray-200"
              @click="router.push('/')"
            >
              <div i-carbon-arrow-left />
              <span>{{ t('button.back') || 'Back' }}</span>
            </button>

            <div mb-4 flex flex-wrap items-center gap-3>
              <span
                v-for="cat in blog.currentPost.categories" :key="cat.id"
                inline-block rounded-full px-3 py-1 text-xs font-medium bg="teal-100 dark:teal-900/50"
                text="teal-700 dark:teal-300"
              >{{ cat.name }}</span>
              <span text="sm gray-400 dark:gray-500">{{ formatDate(blog.currentPost.createdAt) }}</span>
              <span v-if="blog.currentPost.updatedAt !== blog.currentPost.createdAt" text="xs gray-400 dark:gray-500">
                ({{ t('blog.updated') || 'updated' }})
              </span>
            </div>

            <h1 text="3xl md:4xl gray-800 dark:gray-100" mb-4 font-bold>
              {{ blog.currentPost.title }}
            </h1>

            <div flex items-center gap-3 pb-6 border-b="~ gray-200 dark:gray-700">
              <div bg="teal-100 dark:teal-900/50" text="teal-600 dark:teal-400" h-10 w-10 flex items-center justify-center rounded-full font-bold>
                <div i-carbon-user />
              </div>
              <div>
                <div text="sm gray-800 dark:gray-200" font-medium>
                  {{ t('blog.author') || 'Author' }}
                </div>
                <div text="xs gray-400 dark:gray-500">
                  {{ blog.currentPost.views }} {{ t('blog.views') || 'views' }}
                </div>
              </div>
              <div v-if="isAuthor" ml-auto flex items-center gap-2>
                <button
                  flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm
                  bg="gray-100 dark:gray-700 hover:gray-200 dark:hover:gray-600" text="gray-600 dark:gray-300"
                  @click="goToEdit"
                >
                  <div i-carbon-edit /><span class="hidden sm:inline">{{ t('blog.edit') || 'Edit' }}</span>
                </button>
                <button
                  flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm
                  bg="red-50 dark:red-900/30 hover:red-100 dark:hover:red-900/50" text="red-600 dark:red-400"
                  @click="showDeleteConfirm = true"
                >
                  <div i-carbon-trash-can /><span class="hidden sm:inline">{{ t('blog.delete') || 'Delete' }}</span>
                </button>
              </div>
            </div>

            <MdPreview :editor-id="previewId" :model-value="blog.currentPost.content" :theme="isDark ? 'dark' : 'light'" class="blog-preview" />
          </div>

          <!-- Catalog sidebar -->
          <aside v-if="tocItems.length" hidden w-56 flex-shrink-0 lg:block>
            <div sticky top-20>
              <div text="xs gray-500 dark:gray-400" mb-3 px-2 font-semibold tracking-wider uppercase>
                {{ t('blog.catalog') || 'Contents' }}
              </div>
              <nav flex flex-col>
                <div
                  v-for="item in tocItems"
                  :key="item.id"
                  cursor-pointer truncate text-xs leading-relaxed transition-colors
                  :style="{ padding: `4px 0 4px ${8 + item.indent * 12}px` }"
                  :class="activeTocId === item.id
                    ? 'text-teal-600 dark:text-teal-400 font-medium border-l-2 border-teal-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-l-2 border-transparent'"
                  @click="scrollToToc(item)"
                >
                  {{ item.title }}
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </template>
    </div>

    <!-- Back to top -->
    <Teleport to="body">
      <button
        v-show="showBackToTop"

        bg="teal-600 hover:teal-500"
        text="white"
        shadow="lg hover:xl"
        fixed bottom-8 right-8 z-50 h-11 w-11 flex items-center justify-center rounded-full transition-all duration-200
        aria-label="回到顶部"
        @click="scrollToTop"
      >
        <div i-carbon-arrow-up text-lg />
      </button>
    </Teleport>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm" fixed inset-0 z-50 flex items-center justify-center p-4 bg="black/40"
        @click.self="showDeleteConfirm = false"
      >
        <div max-w-sm w-full rounded-2xl p-6 bg="white dark:gray-800" shadow="xl" border="~ gray-200 dark:gray-700">
          <h3 text="lg gray-800 dark:gray-100" mb-2 font-bold>
            {{ t('blog.delete_confirm_title') || 'Delete Post?' }}
          </h3>
          <p text="sm gray-500 dark:gray-400" mb-6>
            {{ t('blog.delete_confirm_desc') || 'This action cannot be undone. Are you sure you want to delete this post?'
            }}
          </p>
          <div flex justify-end gap-3>
            <button
              rounded-lg px-4 py-2 text-sm font-medium
              bg="gray-100 dark:gray-700 hover:gray-200 dark:hover:gray-600" text="gray-600 dark:gray-300"
              @click="showDeleteConfirm = false"
            >
              {{ t('blog.cancel') || 'Cancel' }}
            </button>
            <button
              rounded-lg px-4 py-2 text-sm font-medium bg="red-600 hover:red-700" text="white" :disabled="deleting"
              @click="handleDelete"
            >
              <span v-if="deleting" flex items-center gap-1>
                <div i-carbon-circle-dash animate-spin />
                {{ t('blog.deleting') || 'Deleting...' }}
              </span>
              <span v-else>{{ t('blog.delete') || 'Delete' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.blog-preview {
  --md-bg: transparent;
  background: transparent !important;
}
.blog-preview :deep(ol) {
  list-style: decimal;
  padding-left: 2em;
}
.blog-preview :deep(ul) {
  list-style: disc;
  padding-left: 2em;
}
.blog-preview :deep(li) {
  margin-bottom: 0.25em;
}
</style>
