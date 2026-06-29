<script setup lang="ts">
defineOptions({ name: 'IndexPage' })

const blog = useBlogStore()
const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

useHead({ title: () => t('blog.project_name') || 'MyBlog' })

onMounted(async () => {
  await Promise.all([blog.fetchCategories(), blog.fetchPosts()])
})

function toggleSort(field: 'title' | 'createdAt' | 'updatedAt') {
  if (blog.sortField === field) {
    blog.sortOrder = blog.sortOrder === 'asc' ? 'desc' : 'asc'
  }
  else {
    blog.sortField = field
    blog.sortOrder = 'desc'
  }
}

function goToWrite() {
  if (!auth.isLoggedIn) {
    router.push('/auth/login')
  }
  else {
    router.push('/blog/write')
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div mx-auto max-w-6xl>
    <!-- Hero / Welcome -->
    <div py-8 md:py-8>
      <h1 text="3xl md:4xl gray-800 dark:gray-100" mb-3 font-bold>
        {{ t('home.title', { projectName: t('blog.project_name') || 'MyBlog' }) }}
      </h1>
      <p text="gray-500 dark:gray-400" max-w-2xl>
        {{ t('home.subtitle') || 'Discover stories, ideas, and insights from our community.' }}
      </p>
    </div>

    <!-- Search -->
    <div mb-6>
      <SearchBar />
    </div>

    <!-- Categories -->
    <div mb-6>
      <div flex flex-wrap items-center gap-2>
        <CategoryTag
          :name="t('category.all') || 'All'"
          :active="!blog.selectedCategoryId"
          @click="blog.selectedCategoryId = null"
        />
        <CategoryTag
          v-for="cat in blog.categories"
          :key="cat.id"
          :name="cat.name"
          :active="blog.selectedCategoryId === cat.id"
          @click="blog.selectedCategoryId = blog.selectedCategoryId === cat.id ? null : cat.id"
        />
      </div>
    </div>

    <!-- Sort -->
    <div mb-8 flex items-center gap-1 text-sm>
      <span text="gray-400 dark:gray-500">{{ t("blog.sort") || "Sort" }}:</span>
      <button
        rounded px-2 py-1 transition-colors
        :class="blog.sortField === 'title'
          ? 'text-teal-600 dark:text-teal-400 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="toggleSort('title')"
      >
        {{ t("blog.title") || "Title" }}
        <span v-if="blog.sortField === 'title'" ml-0.5 text-xs>{{ blog.sortOrder === "asc" ? "▲" : "▼" }}</span>
      </button>
      <button
        rounded px-2 py-1 transition-colors
        :class="blog.sortField === 'createdAt'
          ? 'text-teal-600 dark:text-teal-400 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="toggleSort('createdAt')"
      >
        {{ t("blog.created") || "Created" }}
        <span v-if="blog.sortField === 'createdAt'" ml-0.5 text-xs>{{ blog.sortOrder === "asc" ? "▲" : "▼" }}</span>
      </button>
      <button
        rounded px-2 py-1 transition-colors
        :class="blog.sortField === 'updatedAt'
          ? 'text-teal-600 dark:text-teal-400 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        @click="toggleSort('updatedAt')"
      >
        {{ t("blog.updated") || "Updated" }}
        <span v-if="blog.sortField === 'updatedAt'" ml-0.5 text-xs>{{ blog.sortOrder === "asc" ? "▲" : "▼" }}</span>
      </button>
    </div>

    <!-- Blog list -->
    <div v-if="blog.loading" flex justify-center py-20>
      <div i-carbon-circle-dash animate-spin text-3xl text-teal-600 />
    </div>

    <template v-else>
      <!-- Empty state -->
      <div
        v-if="blog.filteredPosts.length === 0"
        py-20 text-center text="gray-400 dark:gray-500"
      >
        <div i-carbon-document-blank mx-auto mb-4 text-5xl />
        <p mb-2 text-lg font-medium>
          {{ t('blog.no_posts') || 'No posts found' }}
        </p>
        <p mb-6 text-sm>
          {{ t('blog.no_posts_desc') || 'Be the first to share your story!' }}
        </p>
        <button btn @click="goToWrite">
          <div i-carbon-edit mr-1 inline-block />
          {{ t('blog.write_first') || 'Write the first post' }}
        </button>
      </div>

      <div v-else grid grid-cols-1 gap-4 pb-8 lg:grid-cols-3 md:grid-cols-2 md:gap-6>
        <div
          v-for="post in blog.filteredPosts"
          :key="post.id"
          cursor-pointer rounded-xl p-6
          bg="white dark:gray-800"
          border="~ gray-200 dark:gray-700 hover:teal-300 dark:hover:teal-700"
          shadow="sm hover:md"
          transition="all duration-200"
          @click="router.push(`/blog/${post.id}`)"
        >
          <!-- Line 1: Title -->
          <h2 text="lg gray-800 dark:gray-100" line-clamp-1 mb-2 font-bold>
            {{ post.title }}
          </h2>
          <!-- Line 2: Content preview -->
          <p text="sm gray-500 dark:gray-400" line-clamp-2 mb-3 leading-relaxed>
            {{ post.summary || post.title }}
          </p>
          <!-- Line 3: Categories + date + views -->
          <div flex flex-wrap items-center gap-2>
            <span
              v-for="cat in post.categories"
              :key="cat.id"
              inline-block rounded-full px-2 py-0.5 text-xs font-medium
              bg="teal-100 dark:teal-900/50" text="teal-700 dark:teal-300"
            >
              {{ cat.name }}
            </span>
            <span text="xs gray-400 dark:gray-500">·</span>
            <span text="xs gray-400 dark:gray-500">{{ formatDate(post.updatedAt) }}</span>
            <span text="xs gray-400 dark:gray-500">·</span>
            <div flex items-center gap-1 text="xs gray-400 dark:gray-500">
              <div i-carbon-view text-xs />
              <span>{{ post.views }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
