<script setup lang="ts">
defineOptions({ name: 'KbChatPage' })

const { t } = useI18n()
useHead({ title: () => t('knowledge.chat') || 'AI Chat' })

const messages = ref<Array<{ role: 'user' | 'ai'; content: string; time: string }>>([
  { role: 'ai', content: '你好！我是 AI 助手，有什么可以帮助你的吗？', time: '10:00' },
])

const input = ref('')
const sending = ref(false)
const chatContainer = ref<HTMLDivElement>()

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

async function send() {
  const text = input.value.trim()
  if (!text || sending.value) return

  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  messages.value.push({ role: 'user', content: text, time })
  input.value = ''
  scrollToBottom()

  sending.value = true
  // Simulate AI response
  await new Promise(r => setTimeout(r, 1000))
  messages.value.push({
    role: 'ai',
    content: `收到你的消息：「${text}」。这是一个模拟的 AI 回复，后续可以接入真实的 LLM API。`,
    time: `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`,
  })
  sending.value = false
  scrollToBottom()
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div h-full flex flex-col max-w-3xl mx-auto w-full>
    <!-- Messages -->
    <div ref="chatContainer" flex-1 overflow-y-auto px-6 py-4 space-y-4>
      <!-- Inline status badge (not a header) -->
      <div flex justify-center mb-2>
        <span
          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
          bg="white dark:gray-800" border="~ gray-200 dark:gray-700"
          text="gray-500 dark:gray-400"
        >
          <span w-1.5 h-1.5 rounded-full bg-green-500 inline-block />
          AI 助手 · {{ t('knowledge.online') || 'Online' }}
        </span>
      </div>
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        flex
      >
        <div
          max-w-80%
          :class="msg.role === 'user'
            ? 'bg-teal-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-xl rounded-tr-xl rounded-br-xl border border-gray-200 dark:border-gray-700'"
          px-4 py-2.5 text-sm leading-relaxed shadow-sm
        >
          {{ msg.content }}
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="sending" flex justify-start>
        <div
          px-4 py-2.5 rounded-tl-xl rounded-tr-xl rounded-br-xl text-sm
          bg="white dark:gray-800"
          border="~ gray-200 dark:gray-700"
          flex items-center gap-1
        >
          <span w-2 h-2 rounded-full bg-gray-400 animate-bounce style="animation-delay: 0ms" />
          <span w-2 h-2 rounded-full bg-gray-400 animate-bounce style="animation-delay: 150ms" />
          <span w-2 h-2 rounded-full bg-gray-400 animate-bounce style="animation-delay: 300ms" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div px-6 py-4 border-t="~ gray-200 dark:gray-700" bg="white dark:gray-800">
      <div flex items-center gap-2>
        <input
          v-model="input"
          type="text"
          flex-1 p="x-4 y-2.5" rounded-xl
          text="sm gray-700 dark:gray-300"
          bg="gray-100 dark:gray-700"
          border="none"
          outline="none focus:ring-2 focus:ring-teal-500"
          :placeholder="t('knowledge.chat_placeholder') || 'Type a message...'"
          @keydown.enter="send"
        >
        <button
          w-10 h-10 rounded-xl flex items-center justify-center
          bg="teal-600 hover:teal-700" text-white
          border-none cursor-pointer
          :disabled="!input.trim() || sending"
          :class="(!input.trim() || sending) ? 'opacity-50 cursor-not-allowed' : ''"
          @click="send"
        >
          <div i-carbon-send />
        </button>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: knowledge
</route>
