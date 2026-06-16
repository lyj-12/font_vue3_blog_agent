<script setup lang="ts">
defineOptions({ name: 'IndexPage' })

const blog = useBlogStore()
const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

useHead({ title: () => 'MyBlog' })

onMounted(async () => {
  await Promise.all([blog.fetchCategories(), blog.fetchPosts()])
})

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
        {{ t('home.title') || 'Welcome to MyBlog' }}
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
    <div mb-8>
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
          <div mb-3 flex items-center gap-2>
            <span
              v-if="post.categories[0]"
              inline-block rounded-full px-2.5 py-0.5 text-xs font-medium
              bg="teal-100 dark:teal-900/50" text="teal-700 dark:teal-300"
            >
              {{ post.categories[0].name }}
            </span>
            <span text="xs gray-400 dark:gray-500">{{ formatDate(post.createdAt) }}</span>
          </div>
          <h2 text="lg gray-800 dark:gray-100" line-clamp-2 mb-2 font-bold>
            {{ post.title }}
          </h2>
          <div flex items-center gap-2 text="xs gray-400 dark:gray-500">
            <div i-carbon-view />
            <span>{{ post.views }}</span>
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
