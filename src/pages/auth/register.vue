<script setup lang="ts">
defineOptions({ name: 'RegisterPage' })

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

useHead({ title: () => t('auth.register') || 'Register' })

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const submitting = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await auth.initSession()
  if (auth.isLoggedIn) {
    router.replace('/')
  }
})

async function handleRegister() {
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    errorMsg.value = 'Please fill in all fields'
    return
  }
  if (form.password !== form.confirmPassword) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  if (form.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters'
    return
  }
  submitting.value = true
  errorMsg.value = ''
  try {
    await auth.register(form.username, form.email, form.password)
    router.push('/')
  }
  catch (e: any) {
    errorMsg.value = e.message || 'Registration failed'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div min-h-screen flex items-start justify-center px-4 pt-20 pb-12 bg="gray-50 dark:gray-900">
    <div w-full max-w-md>
      <!-- Header -->
      <div text-center mb-8>
        <RouterLink to="/" inline-flex items-center gap-2 text-2xl font-bold mb-2 no-underline>
          <div i-carbon-blog text-3xl text-teal-600 />
          <span text="gray-800 dark:gray-100">MyBlog</span>
        </RouterLink>
        <p text="sm gray-500 dark:gray-400">
          {{ t('auth.register_desc') || 'Create an account to start blogging.' }}
        </p>
      </div>

      <!-- Form -->
      <div
        p-8 rounded-2xl
        bg="white dark:gray-800"
        shadow="sm md:md"
        border="~ gray-200 dark:gray-700"
      >
        <div
          v-if="errorMsg"
          mb-4 p-3 rounded-lg text-sm
          bg="red-50 dark:red-900/30"
          text="red-600 dark:red-400"
          border="~ red-200 dark:red-800"
        >
          {{ errorMsg }}
        </div>

        <form flex flex-col gap-4 @submit.prevent="handleRegister">
          <!-- Username -->
          <div>
            <label text="sm gray-700 dark:gray-300" font-medium mb-1 block>
              {{ t('auth.username') || 'Username' }}
            </label>
            <input
              v-model="form.username"
              type="text"
              w-full p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="Choose a username"
              required
            >
          </div>

          <!-- Email -->
          <div>
            <label text="sm gray-700 dark:gray-300" font-medium mb-1 block>
              {{ t('auth.email') || 'Email' }}
            </label>
            <input
              v-model="form.email"
              type="email"
              w-full p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="Enter your email"
              required
            >
          </div>

          <!-- Password -->
          <div>
            <label text="sm gray-700 dark:gray-300" font-medium mb-1 block>
              {{ t('auth.password') || 'Password' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              w-full p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="At least 6 characters"
              required
            >
          </div>

          <!-- Confirm Password -->
          <div>
            <label text="sm gray-700 dark:gray-300" font-medium mb-1 block>
              {{ t('auth.confirm_password') || 'Confirm Password' }}
            </label>
            <input
              v-model="form.confirmPassword"
              type="password"
              w-full p="x-3 y-2.5"
              text="sm gray-800 dark:gray-200"
              bg="gray-50 dark:gray-900"
              border="~ gray-200 dark:gray-600 rounded-lg"
              outline="none focus:teal-500"
              placeholder="Repeat your password"
              required
            >
          </div>

          <!-- Submit -->
          <button
            btn w-full mt-2 py-2.5 text-sm font-medium
            :disabled="submitting"
          >
            <span v-if="submitting" flex items-center justify-center gap-2>
              <div i-carbon-circle-dash animate-spin />
              {{ t('auth.registering') || 'Creating account...' }}
            </span>
            <span v-else>{{ t('auth.register') || 'Create Account' }}</span>
          </button>
        </form>

        <!-- Login link -->
        <div mt-6 text-center text="sm gray-500 dark:gray-400">
          {{ t('auth.have_account') || 'Already have an account?' }}
          <RouterLink to="/auth/login" class="text-teal-600 hover:text-teal-700 font-medium">
            {{ t('auth.login') || 'Sign in' }}
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
