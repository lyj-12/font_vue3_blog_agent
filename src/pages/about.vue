<script setup lang="ts">
defineOptions({ name: 'AboutPage' })

const { t } = useI18n()

useHead({ title: () => t('about.title') || 'About Me' })
</script>

<template>
  <div mx-auto max-w-3xl py-10>
    <!-- Header -->
    <div mb-10 text-center>
      <div

        bg="teal-100 dark:teal-900/50"
        mx-auto mb-5 h-24 w-24 flex items-center justify-center rounded-full
      >
        <div i-carbon-user-avatar text-5xl text-teal-600 />
      </div>
      <h1 text="3xl gray-800 dark:gray-100" mb-3 font-bold>
        {{ t('about.title') || 'About Me' }}
      </h1>
      <p text="gray-500 dark:gray-400" mx-auto max-w-lg>
        {{ t('about.subtitle') || 'Full-stack developer, open source enthusiast, lifelong learner.' }}
      </p>
    </div>

    <!-- Bio section -->
    <section mb-10>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-pen text-teal-600 />
        {{ t('about.bio') || 'Bio' }}
      </h2>
      <div

        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700"
        text="gray-600 dark:gray-400"
        rounded-xl p-6 leading-relaxed
      >
        <p mb-3>
          Hey there! I'm a passionate developer who loves building things for the web.
          With years of experience in full-stack development, I enjoy turning complex
          problems into simple, elegant solutions.
        </p>
        <p mb-3>
          My tech stack includes Vue, React, Node.js, and Python. I'm particularly
          fond of clean architecture, well-tested code, and great developer experience.
        </p>
        <p>
          When I'm not coding, you can find me reading tech blogs, contributing to
          open source projects, or sharing knowledge through writing and speaking.
        </p>
      </div>
    </section>

    <!-- Skills -->
    <section mb-10>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-tools text-teal-600 />
        {{ t('about.skills') || 'Skills' }}
      </h2>
      <div flex flex-wrap gap-2>
        <span
          v-for="skill in ['Vue.js', 'React', 'TypeScript', 'Node.js', 'Python', 'Docker', 'PostgreSQL', 'GraphQL', 'Tailwind CSS', 'Git']"
          :key="skill"
          rounded-full px-3 py-1.5 text-sm font-medium
          bg="teal-50 dark:teal-900/30"
          text="teal-700 dark:teal-300"
          border="~ teal-200 dark:teal-800"
        >
          {{ skill }}
        </span>
      </div>
    </section>

    <!-- Contact -->
    <section>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-mail-all text-teal-600 />
        {{ t('about.contact') || 'Contact' }}
      </h2>
      <div
        rounded-xl p-6
        bg="white dark:gray-800"
        border="~ gray-200 dark:gray-700"
      >
        <div flex flex-col gap-3>
          <a
            href="mailto:hello@example.com"
            class="flex items-center gap-2 text-gray-600 transition-colors dark:text-gray-400 hover:text-teal-600"
          >
            <div i-carbon-email text-lg />
            <span>liuyingjiemail@126.com</span>
          </a>
          <a
            href="https://github.com/lyj-12"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 text-gray-600 transition-colors dark:text-gray-400 hover:text-teal-600"
          >
            <div i-carbon-logo-github text-lg />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

