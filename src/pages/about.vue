<script setup lang="ts">
defineOptions({ name: 'AboutPage' })

const router = useRouter()
const { t } = useI18n()

useHead({ title: () => t('about.title') || 'About Me' })

const projects = [
  {
    name: t('blog.project_name') || 'MyBlog',
    description: 'A modern blog platform built with Vue 3, featuring markdown editing, category management, and full-text search.',
    tech: ['Vue 3', 'TypeScript', 'UnoCSS', 'Pinia'],
    link: '/project-blog',
    icon: 'i-carbon-blog',
  },
  {
    name: 'Sweet Memory',
    description: 'A collaborative task management app with real-time updates, Kanban boards, and team workspaces.',
    tech: ['React', 'Node.js', 'WebSocket', 'PostgreSQL'],
    link: '/project-sweet-memory',
    icon: 'i-carbon-task-view',
  },
]
</script>

<template>
  <div mx-auto max-w-4xl py-10>
    <!-- Header -->
    <div mb-10 text-center>
      <div bg="teal-100 dark:teal-900/50" mx-auto mb-5 h-24 w-24 flex items-center justify-center rounded-full>
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
        bg="white dark:gray-800" border="~ gray-200 dark:gray-700" text="gray-600 dark:gray-400" rounded-xl p-6
        leading-relaxed
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
          :key="skill" rounded-full px-3 py-1.5 text-sm font-medium bg="teal-50 dark:teal-900/30"
          text="teal-700 dark:teal-300" border="~ teal-200 dark:teal-800"
        >
          {{ skill }}
        </span>
      </div>
    </section>

    <!-- Projects -->
    <section mb-10>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-application text-teal-600 />
        {{ t('projects.title') || 'My Projects' }}
      </h2>
      <div grid grid-cols-1 gap-5 md:grid-cols-2>
        <div
          v-for="project in projects" :key="project.name" bg="white dark:gray-800"
          border="~ gray-200 dark:gray-700 hover:teal-300 dark:hover:teal-700" shadow="sm hover:md"
          transition="all duration-200" block cursor-pointer rounded-xl p-6 @click="router.push(project.link)"
        >
          <div mb-3 flex items-center gap-3>
            <div h-10 w-10 flex items-center justify-center rounded-lg bg="teal-100 dark:teal-900/50">
              <div :class="project.icon" text-xl text-teal-600 />
            </div>
            <h3 text="lg gray-800 dark:gray-100" font-bold>
              {{ project.name }}
            </h3>
          </div>
          <p text="sm gray-500 dark:gray-400" mb-4 leading-relaxed>
            {{ project.description }}
          </p>
          <div flex flex-wrap gap-1.5>
            <span
              v-for="t in project.tech" :key="t" rounded px-2 py-0.5 text-xs font-medium bg="gray-100 dark:gray-700"
              text="gray-500 dark:gray-400"
            >
              {{ t }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Publications -->
    <section mb-10>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-document text-teal-600 />
        Publications
      </h2>
      <div rounded-xl p-6 bg="white dark:gray-800" border="~ gray-200 dark:gray-700">
        <div flex flex-col gap-5>
          <div>
            <p text="sm gray-600 dark:gray-400" mb-1 leading-relaxed>
              Liu Y, Miao F. Robust urban air quality index prediction for pollution management via entropy-guided
              multiscale denoising and optimization-driven neuro-fuzzy modeling.
              <em>Urban Climate</em> 2026;65:102788.
            </p>
            <a
              href="https://doi.org/10.1016/j.uclim.2026.102788" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 text-xs text-teal-600 no-underline dark:text-teal-400 hover:text-teal-700"
            >
              <div i-carbon-launch />
              doi:10.1016/j.uclim.2026.102788
            </a>
          </div>
          <div>
            <p text="sm gray-600 dark:gray-400" mb-1 leading-relaxed>
              Liu, Y.; Miao, F. Robust Offshore Wind Speed Forecasting via Quantum-Oppositional BKA-Optimized Adaptive
              Neuro-Fuzzy Inference System and Adaptive VMD Denoising.
              <em>J. Mar. Sci. Eng.</em> 2025, 13, 2229.
            </p>
            <a
              href="https://doi.org/10.3390/jmse13122229" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 text-xs text-teal-600 no-underline dark:text-teal-400 hover:text-teal-700"
            >
              <div i-carbon-launch />
              doi:10.3390/jmse13122229
            </a>
          </div>
          <div>
            <p text="sm gray-600 dark:gray-400" mb-1 leading-relaxed>
              Liu, Y.; Miao, F. Improving Offshore Wind Speed Forecasting with a CRGWAA-Enhanced Adaptive Neuro-Fuzzy
              Inference System.
              <em>J. Mar. Sci. Eng.</em> 2025, 13, 908.
            </p>
            <a
              href="https://doi.org/10.3390/jmse13050908" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1 text-xs text-teal-600 no-underline dark:text-teal-400 hover:text-teal-700"
            >
              <div i-carbon-launch />
              doi:10.3390/jmse13050908
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section>
      <h2 text="xl gray-800 dark:gray-100" mb-4 flex items-center gap-2 font-bold>
        <div i-carbon-mail-all text-teal-600 />
        {{ t('about.contact') || 'Contact' }}
      </h2>
      <div rounded-xl p-6 bg="white dark:gray-800" border="~ gray-200 dark:gray-700">
        <div flex flex-col gap-3>
          <a
            href="mailto:hello@example.com"
            class="flex items-center gap-2 text-gray-600 transition-colors dark:text-gray-400 hover:text-teal-600"
          >
            <div i-carbon-email text-lg />
            <span>liuyingjiemail@126.com</span>
          </a>
          <a
            href="https://github.com/lyj-12" target="_blank" rel="noopener"
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
