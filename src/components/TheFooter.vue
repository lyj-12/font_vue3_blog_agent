<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer mt-auto border-t="~ gray-200 dark:gray-700" bg="white dark:gray-800">
    <div mx-auto max-w-6xl px-4 py-4>
      <div flex flex-col items-center justify-between gap-4 md:flex-row>
        <!-- Logo & copyright -->
        <div flex items-center gap-2 text="sm gray-500 dark:gray-400">
          <div i-carbon-blog text-lg text-teal-600 />
          <span>© 2026 YingJie Liu</span>
        </div>

        <!-- Links -->
        <nav flex items-center gap-4 text-sm>
          <RouterLink
            to="/about"
            class="text-gray-500 no-underline transition-colors dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
          >
            {{ t('about.title') || 'About' }}
          </RouterLink>

          <a
            href="https://github.com/lyj-12/vue3_blog_agent"
            target="_blank"
            rel="noopener"
            class="text-gray-500 no-underline transition-colors dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
          >
            GitHub
          </a>
        </nav>
      </div>
    </div>
  </footer>
</template>
