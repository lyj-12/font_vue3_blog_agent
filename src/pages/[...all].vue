<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    {{ t('not-found') }}

    <n-space>
      <n-button>Default</n-button>
      <n-button type="tertiary">
        Tertiary
      </n-button>
      <n-button type="primary">
        Primary
      </n-button>
      <n-button type="info">
        Info
      </n-button>
      <n-button type="success">
        Success
      </n-button>
      <n-button type="warning">
        Warning
      </n-button>
      <n-button type="error">
        Error
      </n-button>

      <n-button strong secondary>
        Default
      </n-button>
      <n-button strong secondary type="tertiary">
        Tertiary
      </n-button>
      <n-button strong secondary type="primary">
        Primary
      </n-button>
      <n-button strong secondary type="info">
        Info
      </n-button>
      <n-button strong secondary type="success">
        Success
      </n-button>
      <n-button strong secondary type="warning">
        Warning
      </n-button>
      <n-button strong secondary type="error">
        Error
      </n-button>
    </n-space>
  </div>
</template>

<route lang="yaml">
meta:
  layout: 404
</route>
