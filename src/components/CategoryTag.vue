<script setup lang="ts">
defineProps<{
  name: string
  active?: boolean
  count?: number
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button

    transition="all duration-200"
    border="~ transparent"
    inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium
    :class="active
      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
    @click="emit('click')"
  >
    <span>{{ name }}</span>
    <span
      v-if="count !== undefined"
      text-xs
      :class="active ? 'text-teal-100' : 'text-gray-400 dark:text-gray-500'"
    >
      ({{ count }})
    </span>
  </button>
</template>
