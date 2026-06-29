<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const menuItems = [
  { path: '/knowledge/chat', icon: 'i-carbon-chat-bot', label: () => t('knowledge.chat') || 'AI Chat' },
  { path: '/knowledge/sessions', icon: 'i-carbon-catalog', label: () => t('knowledge.sessions') || 'Sessions' },
  { path: '/knowledge/daily', icon: 'i-carbon-summary-KPI', label: () => t('knowledge.daily') || 'Daily Summary' },
]

function isActive(path: string): boolean {
  return route.path === path
}
</script>

<template>
  <div h="[84vh]" flex flex-col bg="gray-50 dark:gray-900" >
    <!-- Body: sidebar + content -->
    <div mx-auto max-w-6xl w-full flex flex-1 overflow-hidden rounded-2xl>
      <!-- Sidebar -->
      <aside border-r="~ gray-200 dark:gray-700" bg="white dark:gray-800" hidden w-72 flex-shrink-0 flex-col md:flex>
        <!-- Logo / brand -->
        <div px-4 py-3 border-b="~ gray-200 dark:gray-700">
          <RouterLink to="/" flex items-center gap-2 text-lg font-bold no-underline>
            <img src="/MoQi.png" alt="MyBlog" class="h-6 w-auto" />
            <span text="gray-800 dark:gray-100">{{ t('blog.project_name') || 'MyBlog' }}</span>
          </RouterLink>
        </div>

        <!-- Nav -->
        <nav flex flex-1 flex-col gap-1 px-3 py-4>
          <div mb-2 px-3 py-2>
            <h2 text="xs gray-500 dark:gray-400" font-semibold tracking-wider uppercase>
              {{ t('knowledge.title') || 'Knowledge Base' }}
            </h2>
          </div>
          <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" flex items-center gap-3 rounded-lg px-3
            py-2.5 text-sm no-underline transition-colors :class="isActive(item.path)
              ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'">
            <div :class="item.icon" text-lg />
            <span>{{ item.label() }}</span>
          </RouterLink>
        </nav>

        <!-- Bottom: back to blog -->
        <div border-t="~ gray-200 dark:gray-700" px-3 py-3>
          <RouterLink to="/"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 no-underline hover:bg-gray-100 dark:text-gray-400 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200">
            <div i-carbon-arrow-left />
            <span>{{ t('button.home') || 'Home' }}</span>
          </RouterLink>
        </div>
      </aside>

      <!-- Content (scrollable) -->
      <div min-w-0 flex-1 overflow-y-auto>
        <!-- Mobile header removed - uses NavBar from default layout -->

        <RouterView />
      </div>
    </div>

    <!-- Mobile bottom tab bar -->
    <div bg="white dark:gray-800" border-t="~ gray-200 dark:gray-700" fixed bottom-0 left-0 right-0 z-30 flex
      justify-around py-2 md:hidden>
      <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path" flex flex-col items-center gap-1 px-3 py-1
        no-underline :class="isActive(item.path)
          ? 'text-teal-600 dark:text-teal-300'
          : 'text-gray-400 dark:text-gray-500'">
        <div :class="item.icon" text-xl />
        <span text-xs>{{ item.label() }}</span>
      </RouterLink>
    </div>
  </div>
</template>
