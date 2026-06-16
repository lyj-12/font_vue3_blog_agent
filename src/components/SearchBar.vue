<script setup lang="ts">
const blog = useBlogStore()
const { t } = useI18n()

const query = ref(blog.searchQuery)
const debouncedQuery = useDebounce(query, 400)

watch(debouncedQuery, (val) => {
  blog.searchQuery = val
  blog.fetchPosts()
})

function clearSearch() {
  query.value = ''
  blog.searchQuery = ''
  blog.fetchPosts()
}
</script>

<template>
  <div flex items-center gap-3>
    <div relative flex-1>
      <div
        class="absolute left-3 top-0 bottom-0 flex items-center justify-center"
        text="gray-400"
      >
        <div i-carbon-search />
      </div>
      <input
        v-model="query"
        type="text"
        :placeholder="t('search.placeholder') || 'Search posts...'"

        w-full py-2.5 pl-10 pr-10
        text="sm gray-700 dark:gray-300"
        bg="gray-100 dark:gray-800"
        border="~ gray-200 dark:gray-600 rounded-lg"
        outline="none focus:teal-500"
      >
      <button
        v-if="query"
        class="absolute right-3 top-0 bottom-0 flex items-center justify-center p-0 border-none bg-transparent cursor-pointer"
        text="gray-400 hover:gray-600"
        @click="clearSearch"
      >
        <div i-carbon-close />
      </button>
    </div>
  </div>
</template>
