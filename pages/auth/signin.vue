<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <NuxtLink
            to="/auth/signup"
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            créez un compte
          </NuxtLink>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              :disabled="loading"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !form.email || !form.password"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define interfaces for type safety
interface LoginForm {
  email: string;
  password: string;
}

interface SignInResult {
  success: boolean;
  error?: string;
}

const { signIn, loading: authLoading } = useAuth()

const form = ref<LoginForm>({
  email: '',
  password: ''
})

const loading = computed((): boolean => authLoading.value)
const error = ref<string>('')

const handleSubmit = async (): Promise<void> => {
  error.value = ''

  if (!form.value.email || !form.value.password) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  try {
    const result = await signIn(form.value.email, form.value.password) as SignInResult

    if (!result.success) {
      error.value = result.error || 'Email ou mot de passe incorrect'
    } else {
      const redirectTo = useRoute().query.redirect as string || '/'
      await navigateTo(redirectTo)
    }
  } catch (err) {
    console.error('Erreur lors de la connexion:', err)
    error.value = 'Une erreur inattendue s\'est produite'
  }
}

definePageMeta({
  layout: 'auth'
})
</script>
