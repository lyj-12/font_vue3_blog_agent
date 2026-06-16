<template>
  <main min-h-screen flex flex-col bg="gray-50 dark:gray-900">
    <NavBar />
    <div flex-1 px-4 py-4>
      <RouterView />
    </div>
    <TheFooter />
  </main>
</template>
