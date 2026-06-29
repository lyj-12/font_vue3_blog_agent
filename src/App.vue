<script setup lang="ts">
useHead({
  title: 'MyBlog',
  meta: [
    {
      name: 'description',
      content: 'A modern blog platform built with Vue 3',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#0d9488' : '#ffffff',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/MoQi.png',
    },
  ],
})
</script>

<template>
  <RouterView />
</template>
