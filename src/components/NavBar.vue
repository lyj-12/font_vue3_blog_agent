<script setup lang="ts">
import { availableLocales, loadLanguageAsync } from '~/modules/i18n'

const router = useRouter()
const auth = useAuthStore()
const blog = useBlogStore()

const { t, locale } = useI18n()

async function toggleLocales() {
  const locales = availableLocales
  const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
  await loadLanguageAsync(newLocale)
  locale.value = newLocale
}

// Init auth session
onMounted(() => {
  auth.initSession()
  // Redirect to login if auth token expired
  if (localStorage.getItem('blog_auth_expired') === '1') {
    localStorage.removeItem('blog_auth_expired')
    router.push('/auth/login')
  }
})

// Mobile menu toggle
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const searchOpen = ref(false)
const searchInput = ref('')

function handleSearch() {
  blog.searchQuery = searchInput.value
  blog.fetchPosts()
  searchOpen.value = false
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

function clearSearch() {
  searchInput.value = ''
  blog.searchQuery = ''
  blog.fetchPosts()
}

async function handleLogout() {
  await auth.logout()
  userMenuOpen.value = false
  router.push('/')
}

function goToWrite() {
  if (!auth.isLoggedIn) {
    router.push('/auth/login')
  }
  else {
    router.push('/blog/write')
  }
}

// Close menus on route change
watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false
  userMenuOpen.value = false
  searchOpen.value = false
})

// Close user menu on click outside
const userMenuRef = ref<HTMLElement>()
onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})
</script>

<template>
  <header
    pos="sticky top-0 z-40"
    bg="white/80 dark:gray-900/80"
    backdrop-blur-sm
    border-b="~ gray-200 dark:gray-700"
  >
    <div mx-auto h-14 max-w-6xl flex items-center justify-between px-4>
      <!-- Logo -->
      <RouterLink to="/" flex items-center gap-2 text-lg font-bold no-underline hover:opacity-80>
        <div i-carbon-blog text-2xl text-teal-600 />
        <span text="gray-800 dark:gray-100">MyBlog</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav hidden items-center gap-4 md:flex>
        <RouterLink to="/about" class="text-sm text-gray-600 no-underline transition-colors dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
          {{ t('about.title') || 'About' }}
        </RouterLink>
        <RouterLink to="/projects" class="text-sm text-gray-600 no-underline transition-colors dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
          {{ t('projects.title') || 'Projects' }}
        </RouterLink>
        <RouterLink to="/knowledge/chat" class="text-sm text-gray-600 no-underline transition-colors dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
          {{ t('knowledge.title') || 'Knowledge' }}
        </RouterLink>
        <!-- Search bar (desktop) -->
        <div relative flex items-center>
          <input
            v-model="searchInput"
            type="text"
            :placeholder="t('search.placeholder') || 'Search posts...'"
            p="x-3 y-1.5"
            text="sm gray-700 dark:gray-300"
            bg="gray-100 dark:gray-800"
            border="~ gray-200 dark:gray-600 rounded-lg"
            outline="none focus:teal-500"
            w-48
            @keydown.enter="handleSearch"
          >
          <button
            v-if="searchInput"
            class="absolute bottom-0 right-7 top-0 flex cursor-pointer items-center justify-center border-none bg-transparent p-0"
            text="gray-400 hover:gray-600"
            @click="clearSearch"
          >
            <div i-carbon-close text-xs />
          </button>
          <button
            class="absolute bottom-0 right-2 top-0 flex cursor-pointer items-center justify-center border-none bg-transparent p-0"
            text="gray-400 hover:teal-600"
            @click="handleSearch"
          >
            <div i-carbon-search text-sm />
          </button>
        </div>

        <button
          btn flex items-center gap-1 text-sm
          @click="goToWrite"
        >
          <div i-carbon-edit />
          <span>{{ t('blog.write') || 'Write' }}</span>
        </button>

        <!-- Auth buttons / User menu -->
        <template v-if="auth.isLoggedIn">
          <div ref="userMenuRef" relative>
            <button
              p="x-2 y-1"
              flex cursor-pointer items-center gap-2 rounded-lg
              bg="hover:gray-100 dark:hover:gray-800"
              @click="userMenuOpen = !userMenuOpen"
            >
              <div i-carbon-user-avatar text-lg text-teal-600 />
              <span text="sm gray-700 dark:gray-300">{{ auth.user?.username }}</span>
              <div i-carbon-chevron-down text-xs transition-transform :class="{ 'rotate-180': userMenuOpen }" />
            </button>

            <!-- Dropdown -->
            <div
              v-if="userMenuOpen"

              bg="white dark:gray-800"
              border="~ gray-200 dark:gray-700"
              absolute right-0 z-50 mt-2 w-40 rounded-lg py-1 shadow-lg
            >
              <button
                w-full flex items-center gap-2 px-4 py-2 text-left text-sm
                text="gray-700 dark:gray-300"
                bg="hover:gray-100 dark:hover:gray-700"
                @click="handleLogout"
              >
                <div i-carbon-logout />
                <span>{{ t('auth.logout') || 'Logout' }}</span>
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/auth/login" btn text-sm>
            {{ t('auth.login') || 'Login' }}
          </RouterLink>
        </template>

        <!-- Language toggle -->
        <button icon-btn :title="t('button.toggle_langs')" @click="toggleLocales()">
          <div i-carbon-language />
        </button>

        <!-- Theme toggle -->
        <button icon-btn :title="t('button.toggle_dark')" @click="toggleDark()">
          <div i="carbon-sun dark:carbon-moon" />
        </button>
      </nav>

      <!-- Mobile hamburger -->
      <div flex items-center gap-2 md:hidden>
        <button icon-btn @click="searchOpen = !searchOpen">
          <div i-carbon-search />
        </button>
        <button icon-btn @click="mobileMenuOpen = !mobileMenuOpen">
          <div :class="mobileMenuOpen ? 'i-carbon-close' : 'i-carbon-menu'" />
        </button>
      </div>
    </div>

    <!-- Mobile search -->
    <div v-if="searchOpen" px-4 pb-3 md:hidden>
      <div flex items-center gap-2>
        <input
          v-model="searchInput"
          type="text"
          :placeholder="t('search.placeholder') || 'Search posts...'"
          p="x-3 y-2" w-full
          text="sm gray-700 dark:gray-300"
          bg="gray-100 dark:gray-800"
          border="~ gray-200 dark:gray-600 rounded-lg"
          outline="none focus:teal-500"
          @keydown.enter="handleSearch"
        >
        <button btn text-sm @click="handleSearch">
          {{ t('search.button') || 'Search' }}
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" border-t="~ gray-200 dark:gray-700" bg="white dark:gray-900" px-4 py-3 md:hidden>
      <nav flex flex-col gap-2>
        <RouterLink
          to="/about"
          class="flex items-center gap-2 rounded-lg p-2 text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          <div i-carbon-user-avatar text-teal-600 />
          <span>{{ t('about.title') || 'About' }}</span>
        </RouterLink>
        <RouterLink
          to="/projects"
          class="flex items-center gap-2 rounded-lg p-2 text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          <div i-carbon-application text-teal-600 />
          <span>{{ t('projects.title') || 'Projects' }}</span>
        </RouterLink>
        <RouterLink
          to="/knowledge/chat"
          class="flex items-center gap-2 rounded-lg p-2 text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          @click="mobileMenuOpen = false"
        >
          <div i-carbon-notebook text-teal-600 />
          <span>{{ t('knowledge.title') || 'Knowledge' }}</span>
        </RouterLink>

        <button
          w-full flex items-center gap-2 rounded-lg p-2 text-left
          bg="hover:gray-100 dark:hover:gray-800"
          @click="goToWrite(); mobileMenuOpen = false"
        >
          <div i-carbon-edit text-teal-600 />
          <span>{{ t('blog.write') || 'Write a Post' }}</span>
        </button>

        <template v-if="auth.isLoggedIn">
          <div p-2 text="sm gray-500">
            {{ auth.user?.username }}
          </div>
          <button
            w-full flex items-center gap-2 rounded-lg p-2 text-left
            bg="hover:gray-100 dark:hover:gray-800"
            @click="handleLogout"
          >
            <div i-carbon-logout />
            <span>{{ t('auth.logout') || 'Logout' }}</span>
          </button>
        </template>
        <template v-else>
          <RouterLink to="/auth/login" class="flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
            <div i-carbon-login />
            <span>{{ t('auth.login') || 'Login' }}</span>
          </RouterLink>
        </template>

        <button
          w-full flex items-center gap-2 rounded-lg p-2 text-left
          bg="hover:gray-100 dark:hover:gray-800"
          @click="toggleLocales()"
        >
          <div i-carbon-language />
          <span>{{ t('button.toggle_langs') }}</span>
        </button>

        <button
          w-full flex items-center gap-2 rounded-lg p-2 text-left
          bg="hover:gray-100 dark:hover:gray-800"
          @click="toggleDark()"
        >
          <div i="carbon-sun dark:carbon-moon" />
          <span>{{ t('button.toggle_dark') }}</span>
        </button>
      </nav>
    </div>
  </header>
</template>
