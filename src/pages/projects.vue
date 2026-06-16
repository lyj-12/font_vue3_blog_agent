<script setup lang="ts">
defineOptions({ name: 'ProjectsPage' })

const { t } = useI18n()

useHead({ title: () => t('projects.title') || 'My Projects' })

const projects = [
  {
    name: 'MyBlog',
    description: 'A modern blog platform built with Vue 3, featuring markdown editing, category management, and full-text search.',
    tech: ['Vue 3', 'TypeScript', 'UnoCSS', 'Pinia'],
    link: '/',
    icon: 'i-carbon-blog',
  },
  {
    name: 'TaskFlow',
    description: 'A collaborative task management app with real-time updates, Kanban boards, and team workspaces.',
    tech: ['React', 'Node.js', 'WebSocket', 'PostgreSQL'],
    link: '#',
    icon: 'i-carbon-task-view',
  },
  {
    name: 'CodeSnippets',
    description: 'A developer tool for organizing and sharing code snippets with syntax highlighting and tagging.',
    tech: ['Vue 3', 'Express', 'MongoDB', 'Docker'],
    link: '#',
    icon: 'i-carbon-code',
  },
  {
    name: 'WeatherNow',
    description: 'A beautiful weather app with 7-day forecasts, radar maps, and severe weather alerts.',
    tech: ['React Native', 'GraphQL', 'AWS Lambda'],
    link: '#',
    icon: 'i-carbon-cloud',
  },
  {
    name: 'DevMetrics',
    description: 'An analytics dashboard for tracking development productivity, code quality, and team velocity.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'Chart.js'],
    link: '#',
    icon: 'i-carbon-dashboard',
  },
  {
    name: 'OpenSource',
    description: 'Various open source contributions including bug fixes, feature additions, and documentation improvements.',
    tech: ['Various', 'Open Source', 'Community'],
    link: '#',
    icon: 'i-carbon-logo-github',
  },
]
</script>

<template>
  <div mx-auto max-w-4xl py-10>
    <!-- Header -->
    <div mb-10 text-center>
      <h1 text="3xl gray-800 dark:gray-100" font-bold mb-3>
        {{ t('projects.title') || 'My Projects' }}
      </h1>
      <p text="gray-500 dark:gray-400" max-w-lg mx-auto>
        {{ t('projects.subtitle') || 'A selection of things I\'ve built and contributed to.' }}
      </p>
    </div>

    <!-- Project cards -->
    <div grid grid-cols-1 md:grid-cols-2 gap-5>
      <a
        v-for="project in projects"
        :key="project.name"
        :href="project.link"
        :target="project.link.startsWith('http') ? '_blank' : undefined"
        :rel="project.link.startsWith('http') ? 'noopener' : undefined"
        p-6 rounded-xl no-underline
        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700 hover:teal-300 dark:hover:teal-700"
        shadow="sm hover:md"
        transition="all duration-200"
        block
      >
        <div flex items-center gap-3 mb-3>
          <div
            w-10 h-10 rounded-lg flex items-center justify-center
            bg="teal-100 dark:teal-900/50"
          >
            <div :class="project.icon" text-xl text-teal-600 />
          </div>
          <h3 text="lg gray-800 dark:gray-100" font-bold>
            {{ project.name }}
          </h3>
        </div>
        <p text="sm gray-500 dark:gray-400" mb-4 leading-relaxed>
          {{ project.description }}
        </p>
        <div flex flex-wrap gap-1.5>
          <span
            v-for="t in project.tech"
            :key="t"
            px-2 py-0.5 rounded text-xs font-medium
            bg="gray-100 dark:gray-700"
            text="gray-500 dark:gray-400"
          >
            {{ t }}
          </span>
        </div>
      </a>
    </div>
  </div>
</template>

