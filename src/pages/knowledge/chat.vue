<script setup lang="ts">
import type { SourceDoc } from '~/api'
import { MdPreview } from 'md-editor-v3'
import { blogApi, knowledgeApi, sessionApi } from '~/api'
import 'md-editor-v3/lib/style.css'

defineOptions({ name: 'KbChatPage' })

const { t } = useI18n()
useHead({ title: () => t('knowledge.chat') || 'AI Chat' })

// --- Blog title cache for source references ---
const blogTitleCache = ref<Record<number, string>>({})
const route = useRoute()
const router = useRouter()

// --- State ---
const messages = ref<Array<{ role: 'user' | 'assistant', content: string, sources?: SourceDoc[] }>>([])

// --- Session memory ---
const sessionId = ref<number>(0)
const sessionReady = ref(false)
const sessionTitle = ref('')

async function initSession() {
  const sid = Number(route.query.session_id)
  if (sid) {
    sessionId.value = sid
    // Load history
    try {
      sessionReady.value = true
      const msgs = await sessionApi.messages(sid)
      for (const m of msgs) {
        const obj: { role: 'user' | 'assistant', content: string, sources?: SourceDoc[] } = {
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }
        if (m.sources) {
          try {
            obj.sources = JSON.parse(m.sources)
          }
          catch {}
        }
        messages.value.push(obj)
      }
      scrollToBottom()
    }
    catch {
      sessionReady.value = true
    }
  }
  else {
    // No session_id yet — don't auto-create, wait for first send
    sessionReady.value = true
  }
}

async function ensureBlogTitles(sources: SourceDoc[]) {
  const ids = [...new Set(sources.map(s => Number(s.metadata?.blog_id)).filter(Boolean))]
  const missing = ids.filter(id => !blogTitleCache.value[id])
  if (missing.length === 0)
    return
  try {
    const all = await blogApi.list()
    for (const blog of all) {
      blogTitleCache.value[blog.id] = blog.title
    }
  }
  catch {
    // Fallback: just use IDs
    for (const id of missing) {
      blogTitleCache.value[id] = `文章 #${id}`
    }
  }
}

const input = ref('')
const sending = ref(false)
const abortController = ref<AbortController | null>(null)
const chatContainer = ref<HTMLDivElement>()
const currentAiIndex = ref(-1)
const streamingContent = ref('')

// --- Scroll ---
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// --- Abort ---
function stopGeneration() {
  abortController.value?.abort()
  abortController.value = null
  sending.value = false
}

// --- Source grouping helpers ---
function getUniqueBlogIds(sources: SourceDoc[]): number[] {
  const ids = sources.map(s => Number(s.metadata?.blog_id)).filter(id => id > 0)
  return [...new Set(ids)]
}

function getSourcesByBlog(sources: SourceDoc[], blogId: number): SourceDoc[] {
  return sources.filter(s => Number(s.metadata?.blog_id) === blogId)
}

// --- Send message ---
async function send() {
  const text = input.value.trim()
  if (!text || sending.value)
    return

  // Retry session creation if it failed on mount if it failed on mount
  if (!sessionId.value) {
    try {
      const session = await sessionApi.create()
      sessionId.value = session.id
      sessionTitle.value = session.title
      router.replace({ query: { session_id: session.id } })
    }
    catch {
      return
    }
  }

  // Add user message
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  scrollToBottom()

  // Prepare space for AI response
  const aiIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })
  currentAiIndex.value = aiIndex
  sending.value = true
  streamingContent.value = ''

  abortController.value = knowledgeApi.chat(text, sessionId.value, [], {
    onToken(token: string) {
      streamingContent.value += token
      // Preserve existing properties (sources, etc.) set by onContext
      messages.value[aiIndex] = {
        ...messages.value[aiIndex],
        role: 'assistant',
        content: streamingContent.value,
      }
      scrollToBottom()
    },
    onContext(sources: SourceDoc[]) {
      ensureBlogTitles(sources)
      messages.value[aiIndex] = {
        role: 'assistant',
        content: streamingContent.value,
        sources,
      }
    },
    onError(error: string) {
      streamingContent.value += `\n\n> **Error**: ${error}`
      messages.value[aiIndex] = {
        ...messages.value[aiIndex],
        role: 'assistant',
        content: streamingContent.value,
      }
    },
    onDone() {
      sending.value = false
      abortController.value = null
      scrollToBottom()
    },
  })
}

// --- Mount ---
onMounted(() => {
  initSession()
  scrollToBottom()
})
</script>

<template>
  <div mx-auto h-full max-w-3xl w-full flex flex-col>
    <!-- Messages -->
    <div ref="chatContainer" flex-1 overflow-y-auto px-6 py-5 space-y-5>
      <!-- Online status badge -->
      <div mb-2 flex justify-center>
        <span
          inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs
          bg="white/80 dark:gray-800/80" border="~ gray-200/60 dark:gray-700/60"
          text="gray-500 dark:gray-400"
        >
          <span inline-block h-1.5 w-1.5 rounded-full bg-green-400 />
          AI {{ t('knowledge.online') || 'Online' }}
        </span>
      </div>

      <!-- Empty state -->
      <div v-if="messages.length === 0" flex flex-col items-center justify-center py-16 text-center>
        <div i-carbon-chat-bot mb-4 text-6xl text-gray-300 dark:text-gray-600 />
        <h3 text="lg gray-500 dark:gray-400" mb-2 font-medium>
          {{ t('knowledge.chat') || 'AI Chat' }}
        </h3>
        <p text="sm gray-400 dark:gray-500" max-w-xs>
          从知识库中检索相关内容并生成回答
        </p>
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        flex
      >
        <div
          :max-w="msg.role === 'user' ? '70%' : '85%'"
          :class="msg.role === 'user'
            ? 'bg-teal-500 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
            : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-100 rounded-tl-xl rounded-tr-xl rounded-br-xl border border-gray-200/70 dark:border-gray-700/70'"
          px-5 py-3 text-sm leading-relaxed shadow-sm
        >
          <!-- User message: plain text -->
          <template v-if="msg.role === 'user'">
            {{ msg.content }}
          </template>

          <!-- AI message: markdown rendered -->
          <template v-else>
            <div v-if="msg.content" class="max-w-none prose prose-sm dark:prose-invert">
              <MdPreview
                :model-value="msg.content"
                theme="light"
                :style="{ background: 'transparent', color: 'inherit' }"
              />
            </div>
            <div v-else text-gray-400 italic>
              思考中...
            </div>

            <!-- Sources: grouped by article -->
            <div v-if="msg.sources && msg.sources.length > 0" mt-3 pt-3 border-t="~ gray-200 dark:gray-700">
              <details>
                <summary text="xs text-gray-400 dark:text-gray-300 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200">
                  引用来源 ({{ msg.sources.length }})
                </summary>
                <div mt-2 space-y-3>
                  <template v-for="blogId in getUniqueBlogIds(msg.sources)" :key="blogId">
                    <div
                      v-if="getSourcesByBlog(msg.sources, blogId).length > 0"
                      rounded-lg p-2
                      bg="gray-50/80 dark:gray-700/40"
                    >
                      <!-- Article header -->
                      <a
                        :href="`/blog/${blogId}`"
                        target="_blank"
                        class="mb-1.5 flex items-center gap-1.5 text-xs text-teal-600 no-underline dark:text-teal-400 hover:underline"
                      >
                        <span class="i-carbon-document" />
                        <span truncate font-medium>{{ blogTitleCache[blogId] || `文章 #${blogId}` }}</span>
                        <span i-carbon-arrow-up-right flex-shrink-0 text-gray-400 />
                      </a>
                      <!-- Chunks from this article -->
                      <div
                        v-for="(src, si) in getSourcesByBlog(msg.sources, blogId)"
                        :key="src.metadata?.chunk_id || si"
                        mb-1.5 ml-2 rounded p-1.5
                        bg="white/60 dark:gray-800/60"
                      >
                        <div flex items-center gap-1 text-gray-400>
                          <span class="i-carbon-row-expand text-teal-400" />
                          <span v-if="src.metadata?.h1 || src.metadata?.h2 || src.metadata?.h3" truncate text-gray-500 dark:text-gray-300>
                            {{ src.metadata?.h3 || src.metadata?.h2 || src.metadata?.h1 }}
                          </span>
                          <span v-else>节选</span>
                          <span ml-auto opacity-60>{{ Math.max(0, Math.round((1 - src.score / 2.5) * 100)) }}%</span>
                        </div>
                        <p line-clamp-1 mt-0.5 text-gray-500 dark:text-gray-300>
                          {{ src.content }}
                        </p>
                      </div>
                    </div>
                  </template>
                </div>
              </details>
            </div>
          </template>
        </div>
      </div>

      <!-- Typing indicator (only while streaming and content is empty) -->
      <div v-if="sending && streamingContent === ''" flex justify-start>
        <div

          bg="white/80 dark:gray-800/80"
          border="~ gray-200/60 dark:gray-700/60"
          flex items-center gap-1.5 rounded-br-xl rounded-tl-xl rounded-tr-xl px-5 py-3 text-sm
        >
          <span h-2 w-2 animate-bounce rounded-full bg-teal-400 style="animation-delay: 0ms" />
          <span h-2 w-2 animate-bounce rounded-full bg-teal-400 style="animation-delay: 150ms" />
          <span h-2 w-2 animate-bounce rounded-full bg-teal-400 style="animation-delay: 300ms" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div px-6 py-4 border-t="~ gray-200/70 dark:gray-700/70" bg="white/80 dark:gray-800/80">
      <div flex items-center gap-2>
        <input
          v-model="input"
          type="text"
          flex-1 p="x-4 y-3" rounded-2xl
          text="sm gray-700 dark:gray-200"
          bg="gray-100/80 dark:gray-700/80"
          border="none"
          outline="none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50"
          :placeholder="t('knowledge.chat_placeholder') || 'Type a message...'"
          :disabled="sending"
          @keydown.enter="send"
        >
        <button
          v-if="sending"

          bg="red-400 hover:red-500"
          h-10 w-10 flex cursor-pointer items-center justify-center rounded-xl border-none text-white
          @click="stopGeneration"
        >
          <div i-carbon-stop-filled />
        </button>
        <button
          v-else

          bg="teal-500 hover:teal-600"
          h-10 w-10 flex cursor-pointer items-center justify-center rounded-xl border-none text-white
          :disabled="!input.trim()"
          :class="!input.trim() ? 'opacity-50 cursor-not-allowed' : ''"
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
