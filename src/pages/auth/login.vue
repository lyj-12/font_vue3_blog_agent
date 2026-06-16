<script setup lang="ts">
defineOptions({ name: 'LoginPage' })

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

useHead({ title: () => t('auth.login') || 'Login' })

const form = reactive({
  username: '',
  password: '',
})

const submitting = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!form.username || !form.password) {
    errorMsg.value = 'Please fill in all fields'
    return
  }
  submitting.value = true
  errorMsg.value = ''
  try {
    await auth.login(form.username, form.password)
    router.push('/')
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Login failed'
  }
  finally {
    submitting.value = false
  }
}

// Redirect if already logged in
if (auth.isLoggedIn) {
  router.replace('/')
}
</script>

<template>
  <div min-h-screen flex items-start justify-center px-4 pb-12 pt-20 bg="gray-50 dark:gray-900">
    <div max-w-md w-full>
      <!-- Header -->
      <div mb-8 text-center>
        <RouterLink to="/" mb-2 inline-flex items-center gap-2 text-2xl font-bold no-underline>
          <div i-carbon-blog text-3xl text-teal-600 />
          <span text="gray-800 dark:gray-100">MyBlog</span>
        </RouterLink>
        <p text="sm gray-500 dark:gray-400">
          {{ t('auth.login_desc') || 'Welcome back! Sign in to your account.' }}
        </p>
      </div>

      <!-- Form -->
      <div
        rounded-2xl p-8
        bg="white dark:gray-800"
        shadow="sm md:md"
        border="~ gray-200 dark:gray-700"
      >
        <!-- Error -->
        <div
          v-if="errorMsg"
          mb-4 rounded-lg p-3 text-sm
          bg="red-50 dark:red-900/30"
          text="red-600 dark:red-400"
          border="~ red-200 dark:red-800"
        >
          {{ errorMsg }}
        </div>

        <form flex flex-col gap-4 @submit.prevent="handleLogin">
          <!-- Username/Email -->
          <div>
            <label text="sm gray-700 dark:gray-300" mb-1 block font-medium>
              {{ t('auth.username') || 'Username' }}
            </label>
            <input
              v-model="form.username"
              type="text"
              p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="Enter your username or email"
              required w-full
            >
          </div>

          <!-- Password -->
          <div>
            <label text="sm gray-700 dark:gray-300" mb-1 block font-medium>
              {{ t('auth.password') || 'Password' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="Enter your password"
              required w-full
            >
          </div>

          <!-- Submit -->
          <button
            mt-2 btn w-full py-2.5 text-sm font-medium
            :disabled="submitting"
          >
            <span v-if="submitting" flex items-center justify-center gap-2>
              <div i-carbon-circle-dash animate-spin />
              {{ t('auth.logging_in') || 'Signing in...' }}
            </span>
            <span v-else>{{ t('auth.login') || 'Sign In' }}</span>
          </button>
        </form>

        <!-- Register link -->
        <div mt-6 text-center text="sm gray-500 dark:gray-400">
          {{ t('auth.no_account') || "Don't have an account?" }}
          <RouterLink to="/auth/register" class="text-teal-600 font-medium hover:text-teal-700">
            {{ t('auth.register') || 'Sign up' }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
</route>
