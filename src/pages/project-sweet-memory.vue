<script setup lang="ts">
defineOptions({ name: 'ProjectSweetMemoryPage' })

const router = useRouter()
const { t } = useI18n()

const project = {
  name: 'Sweet Memory',
  description: 'A collaborative task management app with real-time updates, Kanban boards, and team workspaces.',
  tech: ['React', 'Node.js', 'WebSocket', 'PostgreSQL'],
  icon: 'i-carbon-task-view',
}

useHead({ title: () => project.name })
</script>

<template>
  <div mx-auto max-w-4xl py-3>
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
        v-for="tech in project.tech" :key="tech"
        rounded-lg px-3 py-1 text-sm font-medium bg="gray-100 dark:gray-700" text="gray-600 dark:gray-300"
      >{{ tech }}</span>
    </div>
  </div>
</template>
