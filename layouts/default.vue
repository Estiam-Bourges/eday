<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div>
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900 hover:text-blue-600">
              🐮 Moocow
            </NuxtLink>
            <p class="text-gray-600 mt-1">Partagez vos idées et découvrez celles de la communauté</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <div v-if="!loading && user" class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Bonjour, {{ user.name }}
              </span>
              
              <NuxtLink
                to="/profile"
                class="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm transition-colors"
              >
                <span>Mon profil</span>
              </NuxtLink>
              <button
                @click="handleSignOut"
                :disabled="signingOut"
                class="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm transition-colors disabled:opacity-50"
              >
                <span>{{ signingOut ? 'Déconnexion...' : 'Déconnexion' }}</span>
              </button>
            </div>
            
            <div v-else-if="!loading && !user" class="flex items-center space-x-2">
              <NuxtLink
                to="/auth/signin"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Se connecter
              </NuxtLink>
              <NuxtLink
                to="/auth/signup"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                S'inscrire
              </NuxtLink>
            </div>
            
            <div v-else class="text-sm text-gray-500">
              Chargement...
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
const { user, loading, signOut } = useAuth()
const signingOut = ref(false)

const handleSignOut = async () => {
  signingOut.value = true
  try {
    await signOut()
  } finally {
    signingOut.value = false
  }
}
</script>

<style>
html, body {
  font-family: 'Inter', system-ui, sans-serif;
}
</style>