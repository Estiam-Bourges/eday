<template>
  <div v-if="loading" class="text-center py-12">
    <p class="text-gray-500">Chargement du profil...</p>
  </div>

  <div v-else-if="profileData" class="space-y-6">
    <!-- En-tête du profil -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-2xl font-bold text-white">
            {{ getFirstLetter(profileData.user.name) }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ profileData.user.name }}</h1>
          <p class="text-gray-600">{{ profileData.user.email }}</p>
          <p class="text-sm text-gray-500">
            Membre depuis {{ formatDate(profileData.user.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Statistiques et Actions -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Statistiques -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Mes statistiques</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Idées soumises</span>
            <span class="font-semibold text-blue-600">{{ profileData.stats.ideasCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Commentaires</span>
            <span class="font-semibold text-green-600">{{ profileData.stats.commentsCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Votes donnés</span>
            <span class="font-semibold text-purple-600">{{ profileData.stats.votesCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Votes reçus (👍)</span>
            <span class="font-semibold text-green-500">{{ profileData.stats.totalUpvotes }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Votes reçus (👎)</span>
            <span class="font-semibold text-red-500">{{ profileData.stats.totalDownvotes }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t">
            <span class="text-gray-800 font-medium">Score total</span>
            <span class="font-bold text-lg" :class="getScoreColor()">
              {{ getScore() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-4">Actions</h2>
        <div class="space-y-3">
          <button
            @click="navigateTo('/')"
            class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700 transition-colors"
          >
            <span class="mr-2">📝</span> Proposer une nouvelle idée
          </button>
          
          <button
            @click="signOut()"
            class="w-full text-left px-4 py-2 bg-red-50 hover:bg-red-100 rounded-md text-red-700 transition-colors"
          >
            <span class="mr-2">🚪</span> Se déconnecter
          </button>
        </div>
      </div>
    </div>

    <!-- Mes idées récentes -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Mes idées récentes</h2>
        <span class="text-sm text-gray-500">
          {{ profileData.recentIdeas.length }} idée(s)
        </span>
      </div>
      
      <div v-if="profileData.recentIdeas.length > 0" class="space-y-4">
        <div
          v-for="idea in profileData.recentIdeas"
          :key="idea.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="navigateTo(`/idea/${idea.id}`)"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium text-gray-900">{{ idea.title }}</h3>
            <div class="flex items-center space-x-2 text-sm">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                👍 {{ idea.upvotes }}
              </span>
              <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                👎 {{ idea.downvotes }}
              </span>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-2">
            {{ truncateText(idea.description, 120) }}
          </p>
          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>💬 {{ idea.commentsCount }} commentaire(s)</span>
            <span>{{ formatDate(idea.createdAt) }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-4">💡</div>
        <p class="text-lg mb-2">Aucune idée pour le moment</p>
        <p class="text-sm">Commencez par partager votre première idée !</p>
        <button
          @click="navigateTo('/')"
          class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Proposer une idée
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <p class="text-red-500">Erreur lors du chargement du profil</p>
    <button
      @click="loadProfile"
      class="mt-4 text-blue-600 hover:text-blue-800"
    >
      Réessayer
    </button>
  </div>
</template>

<script setup>
const { user, signOut } = useAuth()

const profileData = ref(null)
const loading = ref(true)

const loadProfile = async () => {
  try {
    loading.value = true
    const data = await $fetch('/api/user/profile', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    profileData.value = data
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
    
    // Si erreur d'authentification, rediriger vers la connexion
    if (error.status === 401) {
      await navigateTo('/auth/signin')
      return
    }
    
    profileData.value = null
  } finally {
    loading.value = false
  }
}

const getFirstLetter = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const getScore = () => {
  if (!profileData.value) return 0
  return profileData.value.stats.totalUpvotes - profileData.value.stats.totalDownvotes
}

const getScoreColor = () => {
  const score = getScore()
  if (score > 0) return 'text-green-600'
  if (score < 0) return 'text-red-600'
  return 'text-gray-600'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

definePageMeta({
  middleware: 'auth'
})

onMounted(() => {
  loadProfile()
})
</script>
