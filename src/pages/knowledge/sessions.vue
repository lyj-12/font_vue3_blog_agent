<script setup lang="ts">
defineOptions({ name: 'KbSessionsPage' })

import type { SessionItem } from '~/api'
import { sessionApi } from '~/api'

const router = useRouter()
const { t } = useI18n()
useHead({ title: () => t('knowledge.sessions') || 'Sessions' })

const sessions = ref<SessionItem[]>([])
const loading = ref(true)

async function loadSessions() {
  loading.value = true
  try {
    sessions.value = await sessionApi.list()
  }
  catch {
    // toast or fallback
  }
  finally {
    loading.value = false
  }
}

function createSession() {
  router.push('/knowledge/chat')
}

const showDeleteModal = ref(false)
const pendingDeleteId = ref(0)

function confirmDeleteSession(id: number, e: Event) {
  e.stopPropagation()
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

async function confirmDelete() {
  const id = pendingDeleteId.value
  if (!id) return
  try {
    await sessionApi.delete(id)
    sessions.value = sessions.value.filter(s => s.id !== id)
  }
  catch {
    // toast or fallback
  }
  showDeleteModal.value = false
}

function openSession(id: number) {
  router.push(`/knowledge/chat?session_id=${id}`)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(loadSessions)
</script>

<template>
  <div max-w-3xl mx-auto w-full px-6 py-6>
    <div flex items-center justify-between mb-6>
      <h1 text="xl gray-800 dark:gray-100" font-bold>
        {{ t('knowledge.sessions') || 'Sessions' }}
      </h1>
      <button btn text-sm flex items-center gap-1 @click="createSession">
        <div i-carbon-add />
        <span>新对话</span>
      </button>
    </div>

    <div v-if="loading" flex justify-center py-12>
      <div i-carbon-loading text-4xl text-gray-400 animate-spin />
    </div>

    <div v-else-if="sessions.length === 0" flex flex-col items-center justify-center py-16 text-center>
      <div i-carbon-catalog text-6xl text-gray-300 dark:text-gray-600 mb-4 />
      <h3 text="lg gray-500 dark:gray-400" font-medium mb-2>暂无对话</h3>
      <p text="sm gray-400 dark:gray-500" max-w-xs>
        点击上方按钮开始一次新的知识库对话
      </p>
    </div>

    <div v-else flex flex-col gap-3>
      <div
        v-for="session in sessions"
        :key="session.id"
        p-4 rounded-xl cursor-pointer transition-all relative
        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700 hover:teal-300 dark:hover:teal-700"
        shadow="sm hover:md"
        @click="openSession(session.id)"
      >
        <div flex items-center justify-between mb-1.5>
          <h3 text="sm gray-800 dark:gray-100" font-medium truncate flex-1 mr-2>
            {{ session.title }}
          </h3>
          <div flex items-center gap-2 flex-shrink-0>
            <span text="xs gray-400 dark:gray-500">{{ formatDate(session.created_at) }}</span>
            <button
              w-6 h-6 rounded flex items-center justify-center
              text="xs gray-400 hover:red-500"
              hover:bg="red-50 dark:red-900/20"
              border="none" cursor-pointer
              @click="confirmDeleteSession(session.id, $event)"
            >
              <div i-carbon-trash-can />
            </button>
          </div>
        </div>
        <p v-if="session.last_message" text="xs gray-500 dark:gray-400" line-clamp-1 mb-2>
          {{ session.last_message }}
        </p>
        <div flex items-center gap-2 text="xs gray-400 dark:gray-500">
          <div i-carbon-chat />
          <span>{{ session.message_count }} 条消息</span>
        </div>
      </div>
    </div>
  </div>
  <!-- Delete confirmation modal -->
  <teleport to="body">
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showDeleteModal = false"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
      >
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
          删除对话
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          确定要删除这个对话吗？所有消息将无法恢复。
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border-none cursor-pointer"
            @click="showDeleteModal = false"
          >
            取消
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer"
            @click="confirmDelete"
          >
            确定删除
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<route lang="yaml">
meta:
  layout: knowledge
</route>
