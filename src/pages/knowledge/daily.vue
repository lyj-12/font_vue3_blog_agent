<script setup lang="ts">
defineOptions({ name: 'KbDailyPage' })

const { t } = useI18n()
useHead({ title: () => t('knowledge.daily') || 'Daily Summary' })

interface DailyItem {
  date: string
  summary: string
  highlights: string[]
  tags: string[]
}

const items = ref<DailyItem[]>([
  {
    date: '2026-06-15',
    summary: '今天主要完成了 Vue 3 博客项目的前端页面搭建，包括用户认证、博客 CRUD 和搜索功能。修复了多个 UI 问题，添加了知识库模块。',
    highlights: ['完成了 6 个页面的开发', '修复了 UnoCSS 属性解析问题', '整合了后端认证 API'],
    tags: ['Vue 3', 'Frontend', 'Blog'],
  },
  {
    date: '2026-06-14',
    summary: '搭建了博客后端 API 框架，实现了用户注册登录功能，使用 FastAPI + SQLModel + JWT 认证方案。',
    highlights: ['FastAPI 项目初始化', 'JWT 认证实现', '数据库模型设计'],
    tags: ['FastAPI', 'Backend', 'Auth'],
  },
  {
    date: '2026-06-13',
    summary: '学习了 Vue 3 组合式 API 的进阶用法，整理了相关的笔记和代码示例。',
    highlights: ['组合式 API 深入理解', 'Pinia 状态管理', 'VueUse 工具库'],
    tags: ['Vue 3', 'Learning'],
  },
])
</script>

<template>
  <div max-w-3xl mx-auto w-full px-6 py-6>
    <div flex items-center justify-between mb-6>
      <h1 text="xl gray-800 dark:gray-100" font-bold>
        {{ t('knowledge.daily') || 'Daily Summary' }}
      </h1>
      <button btn text-sm flex items-center gap-1>
        <div i-carbon-add />
        <span>新建总结</span>
      </button>
    </div>

    <div flex flex-col gap-5>
      <div
        v-for="item in items"
        :key="item.date"
        p-5 rounded-xl
        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700"
        shadow-sm
      >
        <!-- Date -->
        <div flex items-center gap-2 mb-3>
          <div w-8 h-8 rounded-lg flex items-center justify-center bg="teal-100 dark:teal-900/50">
            <div i-carbon-calendar text-teal-600 />
          </div>
          <span text="sm gray-800 dark:gray-200" font-semibold>{{ item.date }}</span>
        </div>

        <!-- Summary -->
        <p text="sm gray-600 dark:gray-400" leading-relaxed mb-3>
          {{ item.summary }}
        </p>

        <!-- Highlights -->
        <div mb-3>
          <div text="xs gray-500 dark:gray-400" font-medium mb-1.5>亮点</div>
          <ul ml-4 space-y-1>
            <li v-for="h in item.highlights" :key="h" text="sm gray-600 dark:gray-400" list-disc>
              {{ h }}
            </li>
          </ul>
        </div>

        <!-- Tags -->
        <div flex flex-wrap gap-1.5>
          <span
            v-for="tag in item.tags"
            :key="tag"
            px-2 py-0.5 rounded text-xs font-medium
            bg="teal-50 dark:teal-900/30"
            text="teal-700 dark:teal-300"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: knowledge
</route>
