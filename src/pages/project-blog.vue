<script setup lang="ts">
defineOptions({ name: 'ProjectBlogPage' })

const router = useRouter()
const { t } = useI18n()

const project = {
  name: t('blog.project_name') || 'MyBlog',
  description: 'A modern blog platform built with Vue 3, featuring markdown editing, category management, and full-text search.',
  tech: ['Vue 3', 'TypeScript', 'UnoCSS', 'Pinia', 'MdEditorV3'],
  icon: 'i-carbon-blog',
}

const techLinks: Record<string, string> = {
  'Vue 3': 'https://vuejs.org/',
  'TypeScript': 'https://www.typescriptlang.org/',
  'UnoCSS': 'https://unocss.dev/',
  'Pinia': 'https://pinia.vuejs.org/',
  'MdEditorV3': 'https://imzbf.github.io/md-editor-v3/zh-CN/demo',
}

const openLink = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')

useHead({ title: () => project.name })
</script>

<template>
  <div mx-auto max-w-3xl py-10>
    <button
      mb-8 flex items-center gap-1 text-sm text="gray-500 hover:gray-700 dark:gray-400 dark:hover:gray-200"
      @click="router.push('/about')"
    >
      <div i-carbon-arrow-left />
      <span>{{ t("button.back") || "Back" }}</span>
    </button>

    <div mb-6 flex items-center gap-4>
      <div h-14 w-14 flex items-center justify-center rounded-xl bg="teal-100 dark:teal-900/50">
        <div :class="project.icon" text-2xl text-teal-600 />
      </div>
      <div>
        <h1 text="2xl gray-800 dark:gray-100" font-bold>
          {{ project.name }}
        </h1>
      </div>
    </div>

    <p text="gray-500 dark:gray-400" mb-8 leading-relaxed>
      {{ project.description }}
    </p>

    <h3 text="sm gray-500 dark:gray-400" mb-3 font-semibold tracking-wider uppercase>
      Tech Stack
    </h3>
    <div flex flex-wrap gap-2>
      <span
        v-for="tech in project.tech" :key="tech" cursor-pointer select-none
        rounded-full px-3 py-1.5 text-sm font-medium bg="teal-50 dark:teal-900/30"
        text="teal-700 dark:teal-300" border="~ teal-200 dark:teal-800" hover="bg-teal-100 dark:bg-teal-800/40 shadow-sm"
        @click="openLink(techLinks[tech])"
      >{{ tech }}</span>
    </div>
  </div>
</template>
