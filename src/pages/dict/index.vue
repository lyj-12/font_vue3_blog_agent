<script setup lang="ts">
import type { WordDictItem } from '~/api'
import { wordDictApi } from '~/api'

defineOptions({ name: 'DictPage' })

useHead({ title: '单词词典' })

const ALL_CHAPTERS = [
  'Chapter 1 自然地理',
  'Chapter 2 植物研究',
  'Chapter 3 动物保护',
  'Chapter 4 太空探索',
  'Chapter 5 学校教育',
  'Chapter 6 科技发明',
  'Chapter 7 文化历史',
  'Chapter 8 语言演化',
  'Chapter 9 娱乐运动',
  'Chapter 10 物品材料',
  'Chapter 11 时尚潮流',
  'Chapter 12 饮食健康',
  'Chapter 13 建筑场所',
  'Chapter 14 交通旅行',
  'Chapter 15 国家政府',
  'Chapter 16 社会经济',
  'Chapter 17 法律法规',
  'Chapter 18 沙场争锋',
  'Chapter 19 社会角色',
  'Chapter 20 行为动作',
  'Chapter 21 身心健康',
  'Chapter 22 时间日期',
]


// --- State ---
const words = ref<WordDictItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedChapter = ref<string | null>(null)

// --- Computed ---
const chapterIndex = new Map(ALL_CHAPTERS.map((ch, i) => [ch, i]))

const chapters = computed(() => {
  const set = new Set<string>()
  for (const w of words.value) {
    if (w.chapter && ALL_CHAPTERS.includes(w.chapter))
      set.add(w.chapter)
  }
  return [...set].sort((a, b) => (chapterIndex.get(a) ?? 999) - (chapterIndex.get(b) ?? 999))
})

const filteredWords = computed(() => {
  let list = words.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(w => w.word_detail?.toLowerCase().includes(q))
  }
  if (selectedChapter.value) {
    list = list.filter(w => w.chapter === selectedChapter.value)
  }
  return list
})

interface ChapterGroup {
  chapter: string
  items: WordDictItem[]
}

const groupedWords = computed(() => {
  const map = new Map<string, WordDictItem[]>()
  for (const w of filteredWords.value) {
    const key = w.chapter || '未分类'
    if (!map.has(key))
      map.set(key, [])
    map.get(key)!.push(w)
  }
  const groups: ChapterGroup[] = []
  // 有章节的按单元序号排
  const sorted = [...map.entries()].sort(([a], [b]) => {
    if (a === '未分类') return 1
    if (b === '未分类') return -1
    const ia = chapterIndex.get(a) ?? 999
    const ib = chapterIndex.get(b) ?? 999
    return ia - ib
  })
  for (const [chapter, items] of sorted) {
    groups.push({ chapter, items })
  }
  return groups
})

// --- Load ---
async function loadWords() {
  loading.value = true
  try {
    words.value = await wordDictApi.list()
  }
  catch (e: any) {
    console.error('加载单词失败', e)
  }
  finally {
    loading.value = false
  }
}

// --- Play pronunciation ---
function playAudio(url: string | null) {
  if (!url)
    return
  const audio = new Audio(url)
  audio.play().catch(() => {})
}

// --- Add word ---
const showAddModal = ref(false)
const addForm = reactive({
  word: '',
  chapter: '',
  remark: '',
})
const adding = ref(false)
const addError = ref('')

function openAddModal(chapter?: string) {
  addForm.word = ''
  addForm.chapter = chapter ?? ''
  addForm.remark = ''
  addError.value = ''
  showAddModal.value = true
}

async function submitAdd() {
  const word = addForm.word.trim()
  if (!word) {
    addError.value = '请输入单词'
    return
  }
  adding.value = true
  addError.value = ''
  try {
    const newItem = await wordDictApi.create({
      word,
      chapter: addForm.chapter.trim() || null,
      remark: addForm.remark.trim() || null,
    })
    words.value.unshift(newItem)
    showAddModal.value = false
  }
  catch (e: any) {
    addError.value = e.message || '添加失败'
  }
  finally {
    adding.value = false
  }
}

// --- Detail / Edit modal ---
const showDetailModal = ref(false)
const detailItem = ref<WordDictItem | null>(null)
const detailForm = reactive({ word: '', remark: '' })
const savingDetail = ref(false)
const detailError = ref('')

function openDetailModal(item: WordDictItem) {
  detailItem.value = item
  detailForm.word = item.word_detail || ''
  detailForm.remark = item.remark || ''
  detailError.value = ''
  showDetailModal.value = true
}

async function saveDetail() {
  const item = detailItem.value
  if (!item) return
  const word = detailForm.word.trim()
  if (!word) {
    detailError.value = '单词不能为空'
    return
  }
  savingDetail.value = true
  detailError.value = ''
  try {
    const updated = await wordDictApi.update(item.id, {
      word,
      remark: detailForm.remark.trim() || null,
    })
    item.word_detail = updated.word_detail
    item.remark = updated.remark
    showDetailModal.value = false
  }
  catch (e: any) {
    detailError.value = e.message || '保存失败'
  }
  finally {
    savingDetail.value = false
  }
}

function closeDetailModal() {
  showDetailModal.value = false
}

// --- Delete ---
const showDeleteConfirm = ref(false)
const pendingDeleteId = ref<number | null>(null)

function confirmDelete(id: number) {
  pendingDeleteId.value = id
  showDeleteConfirm.value = true
}

async function doDelete() {
  const id = pendingDeleteId.value
  if (!id)
    return
  try {
    await wordDictApi.delete(id)
    words.value = words.value.filter(w => w.id !== id)
  }
  catch {
    // ignore
  }
  showDeleteConfirm.value = false
  pendingDeleteId.value = null
}

// --- Init ---
onMounted(() => {
  loadWords()
})
</script>

<template>
  <div mx-auto max-w-6xl w-full px-4 py-3>
    <!-- Header -->
    <div mb-6 flex items-center justify-between>
      <h1 text="xl gray-800 dark:gray-100" flex items-center gap-2 font-bold>
        <div i-carbon-book text-teal-600 />
        单词词典
      </h1>
      <button btn flex items-center gap-1 text-sm @click="openAddModal()">
        <div i-carbon-add />
        <span>添加单词</span>
      </button>
    </div>

    <!-- Search + chapter filter -->
    <div mb-5 flex flex-col gap-3>
      <div relative>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索单词..."
          w-full py-2.5 pl-10 pr-4
          text="sm gray-700 dark:gray-300"
          bg="gray-100 dark:gray-800"
          border="~ gray-200 dark:gray-600 rounded-lg"
          outline="none focus:teal-500"
        >
        <div class="absolute bottom-0 left-3 top-0 flex items-center" text="gray-400">
          <div i-carbon-search />
        </div>
      </div>

      <!-- Chapter tabs -->
      <div v-if="chapters.length > 0" flex flex-wrap items-center gap-2>
        <button
          cursor-pointer rounded-full border-none px-3 py-1 text-xs font-medium transition-colors
          :class="!selectedChapter
            ? 'bg-teal-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          @click="selectedChapter = null"
        >
          全部
        </button>
        <button
          v-for="ch in chapters"
          :key="ch"
          cursor-pointer rounded-full border-none px-3 py-1 text-xs font-medium transition-colors
          :class="selectedChapter === ch
            ? 'bg-teal-500 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          @click="selectedChapter = selectedChapter === ch ? null : ch"
        >
          {{ ch }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" flex justify-center py-16>
      <div i-carbon-circle-dash animate-spin text-3xl text-teal-600 />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="words.length === 0"
      py-16 text-center text="gray-400 dark:gray-500"
    >
      <div i-carbon-book mx-auto mb-4 text-5xl />
      <p mb-2 text-base font-medium>
        还没有单词
      </p>
      <p mb-6 text-sm>
        点击上方按钮添加你的第一个单词
      </p>
    </div>

    <!-- Word list grouped by chapter -->
    <div v-else space-y-6>
      <div v-if="filteredWords.length === 0" py-10 text-center text="gray-400 dark:gray-500 text-sm">
        没有匹配的单词
      </div>

      <div v-for="group in groupedWords" :key="group.chapter">
        <!-- Chapter heading -->
        <h2
          text="sm gray-500 dark:gray-400"
          mb-3 flex items-center gap-2 font-semibold
        >
          <div i-carbon-folder />
          {{ group.chapter }}
          <span text-xs opacity-60>({{ group.items.length }})</span>
          <button
            ml-auto cursor-pointer border-none bg-transparent text-xs font-medium
            text="teal-600 hover:teal-700 dark:teal-400 dark:hover:teal-300"
            @click="openAddModal(group.chapter)"
          >
            + 添加
          </button>
        </h2>

        <!-- Word cards -->
        <div grid grid-cols-1 md:grid-cols-3 gap-3>
          <div
            v-for="item in group.items"
            :key="item.id"

            bg="white dark:gray-800"
            border="~ gray-200 dark:gray-700"

            cursor-pointer select-none
            transition="all duration-150"
            rounded-xl p-4 shadow-sm hover:shadow
            @click="openDetailModal(item)"
          >
            <div flex items-start justify-between>
              <div min-w-0 flex-1>
                <!-- Word + Phonetic -->
                <div mb-1 flex items-center gap-3>
                  <span text="lg gray-800 dark:gray-100" font-bold>{{ item.word_detail }}</span>
                  <button
                    v-if="item.word_uk"
                    flex cursor-pointer items-center gap-1 border-none bg-transparent
                    text="sm teal-600 dark:teal-400 hover:teal-700"
                    :title="item.word_sourceUrl ? '点击发音' : '暂无发音'"
                    @click.stop="playAudio(item.word_sourceUrl)"
                  >
                    <div i-carbon-volume-up />
                    <span>{{ item.word_uk }}</span>
                  </button>
                </div>

                <!-- Chapter badge (only when viewing all chapters) -->
                <div v-if="!selectedChapter && item.chapter" mt-2 flex items-center gap-1>
                  <span
                    rounded px-2 py-0.5 text-xs font-medium
                    bg="teal-50 dark:teal-900/30"
                    text="teal-600 dark:teal-300"
                  >
                    {{ item.chapter }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div ml-3 flex flex-shrink-0 items-center gap-1 @click.stop>
                <button
                  cursor-pointer rounded-lg border-none p-1.5
                  text="gray-400 hover:red-500"
                  bg="hover:red-50 dark:hover:red-900/20"
                  title="删除"
                  @click="confirmDelete(item.id)"
                >
                  <div i-carbon-trash-can text-sm />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add word modal -->
    <teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showAddModal = false"
      >
        <div
          class="mx-4 max-w-md w-full rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <h3 class="mb-4 text-lg text-gray-800 font-bold dark:text-gray-100">
            添加单词
          </h3>

          <div class="space-y-4">
            <!-- Word -->
            <div>
              <label class="mb-1 block text-sm text-gray-600 font-medium dark:text-gray-400">单词 *</label>
              <input
                v-model="addForm.word"
                type="text"
                placeholder="输入英文单词"
                class="w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-gray-600 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-200"
                @keydown.enter="submitAdd"
              >
            </div>

            <!-- Chapter -->
            <div>
              <label class="mb-1 block text-sm text-gray-600 font-medium dark:text-gray-400">章节</label>
              <select
                v-model="addForm.chapter"
                class="w-full cursor-pointer border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-gray-600 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">无</option>
                <option
                  v-for="ch in ALL_CHAPTERS" :key="ch" :value="ch"
                >{{ ch }}</option>
              </select>
            </div>

            <!-- Remark -->
            <div>
              <label class="mb-1 block text-sm text-gray-600 font-medium dark:text-gray-400">备注</label>
              <textarea
                v-model="addForm.remark"
                placeholder="个人备注..."
                rows="2"
                class="w-full resize-none border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-gray-600 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            <!-- Error -->
            <p v-if="addError" class="text-sm text-red-500">
              {{ addError }}
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="cursor-pointer rounded-lg border-none bg-gray-100 px-4 py-2 text-sm text-gray-700 font-medium dark:bg-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="showAddModal = false"
            >
              取消
            </button>
            <button
              class="cursor-pointer rounded-lg border-none bg-teal-500 px-4 py-2 text-sm text-white font-medium disabled:cursor-not-allowed hover:bg-teal-600 disabled:opacity-50"
              :disabled="adding || !addForm.word.trim()"
              @click="submitAdd"
            >
              <template v-if="adding">
                <span class="inline-flex items-center gap-1">
                  <span class="i-carbon-circle-dash animate-spin" />
                  添加中...
                </span>
              </template>
              <template v-else>
                确定添加
              </template>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Detail / Edit modal -->
    <teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeDetailModal"
      >
        <div
          class="mx-4 max-w-md w-full rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <h3 class="mb-4 text-lg text-gray-800 font-bold dark:text-gray-100">
            编辑单词
          </h3>

          <div class="space-y-4">
            <!-- Word -->
            <div>
              <label class="mb-1 block text-sm text-gray-600 font-medium dark:text-gray-400">单词 *</label>
              <input
                v-model="detailForm.word"
                type="text"
                placeholder="输入英文单词"
                class="w-full border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-gray-600 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-200"
                @keydown.enter="saveDetail"
              >
            </div>

            <!-- Remark -->
            <div>
              <label class="mb-1 block text-sm text-gray-600 font-medium dark:text-gray-400">备注</label>
              <textarea
                v-model="detailForm.remark"
                placeholder="个人备注..."
                rows="3"
                class="w-full resize-none border border-gray-300 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-gray-600 focus:border-teal-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            <!-- Error -->
            <p v-if="detailError" class="text-sm text-red-500">
              {{ detailError }}
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="cursor-pointer rounded-lg border-none bg-gray-100 px-4 py-2 text-sm text-gray-700 font-medium dark:bg-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="closeDetailModal"
            >
              取消
            </button>
            <button
              class="cursor-pointer rounded-lg border-none bg-teal-500 px-4 py-2 text-sm text-white font-medium disabled:cursor-not-allowed hover:bg-teal-600 disabled:opacity-50"
              :disabled="savingDetail || !detailForm.word.trim()"
              @click="saveDetail"
            >
              <template v-if="savingDetail">
                <span class="inline-flex items-center gap-1">
                  <span class="i-carbon-circle-dash animate-spin" />
                  保存中...
                </span>
              </template>
              <template v-else>
                保存
              </template>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete confirmation modal -->
    <teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDeleteConfirm = false"
      >
        <div
          class="mx-4 max-w-sm w-full rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <h3 class="mb-2 text-lg text-gray-800 font-bold dark:text-gray-100">
            删除单词
          </h3>
          <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">
            确定要删除这个单词吗？此操作无法撤销。
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="cursor-pointer rounded-lg border-none bg-gray-100 px-4 py-2 text-sm text-gray-700 font-medium dark:bg-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              class="cursor-pointer rounded-lg border-none bg-red-500 px-4 py-2 text-sm text-white font-medium hover:bg-red-600"
              @click="doDelete"
            >
              确定删除
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
