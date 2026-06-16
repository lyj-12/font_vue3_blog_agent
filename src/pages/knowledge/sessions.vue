<script setup lang="ts">
defineOptions({ name: 'KbSessionsPage' })

const { t } = useI18n()
useHead({ title: () => t('knowledge.sessions') || 'Session Management' })

interface Session {
  id: string
  title: string
  lastMessage: string
  date: string
  count: number
}

const sessions = ref<Session[]>([
  { id: '1', title: 'Vue 3 组合式 API 讨论', lastMessage: '如何在 setup 中使用 watch 监听多个数据源的变化？', date: '2026-06-15', count: 24 },
  { id: '2', title: 'Python 后端开发问题', lastMessage: 'FastAPI 的依赖注入系统是怎么实现的？', date: '2026-06-14', count: 18 },
  { id: '3', title: 'CSS 布局技巧', lastMessage: 'Flexbox 和 Grid 在响应式布局中的最佳实践', date: '2026-06-13', count: 12 },
  { id: '4', title: '数据库优化方案', lastMessage: 'PostgreSQL 索引优化和查询计划分析', date: '2026-06-12', count: 31 },
  { id: '5', title: '前端工程化', lastMessage: 'Vite 插件的开发流程和发布到 npm 的注意事项', date: '2026-06-10', count: 8 },
])

function openSession(id: string) {
  // TODO: navigate to session detail or load messages
  // eslint-disable-next-line no-console
  console.log('Open session:', id)
}
</script>

<template>
  <div max-w-3xl mx-auto w-full px-6 py-6>
    <div flex items-center justify-between mb-6>
      <h1 text="xl gray-800 dark:gray-100" font-bold>
        {{ t('knowledge.sessions') || 'Sessions' }}
      </h1>
      <button btn text-sm flex items-center gap-1>
        <div i-carbon-add />
        <span>新建会话</span>
      </button>
    </div>

    <div flex flex-col gap-3>
      <div
        v-for="session in sessions"
        :key="session.id"
        p-4 rounded-xl cursor-pointer transition-all
        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700 hover:teal-300 dark:hover:teal-700"
        shadow="sm hover:md"
        @click="openSession(session.id)"
      >
        <div flex items-center justify-between mb-1.5>
          <h3 text="sm gray-800 dark:gray-100" font-medium>
            {{ session.title }}
          </h3>
          <span text="xs gray-400 dark:gray-500">{{ session.date }}</span>
        </div>
        <p text="xs gray-500 dark:gray-400" line-clamp-1 mb-2>
          {{ session.lastMessage }}
        </p>
        <div flex items-center gap-2 text="xs gray-400 dark:gray-500">
          <div i-carbon-chat flex items-center gap-1>
            <span>{{ session.count }} 条消息</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: knowledge
</route>
