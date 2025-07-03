<template>
  <div v-if="loading" class="text-center py-12">
    <p class="text-gray-500">Chargement...</p>
  </div>
  
  <div v-else-if="idea" class="space-y-6">
    <!-- Bouton retour -->
    <button
      @click="$router.back()"
      class="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
    >
      <span>←</span>
      <span>Retour à la liste</span>
    </button>

    <!-- Détail de l'idée -->
    <div :class="['bg-white rounded-lg shadow p-6 relative', statusGlowClass]">
      <!-- Badge de statut -->
      <div v-if="shouldShowStatusBadge" class="absolute top-4 right-4">
        <div :class="statusBadgeClass" class="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium">
          <span class="text-lg">{{ statusIcon }}</span>
          <span>{{ statusLabel }}</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold mb-2 break-words pr-32">{{ idea.title }}</h1>
      <p class="text-sm text-gray-500 mb-4 break-words">Par {{ idea.author.name }}</p>
      <p class="text-gray-700 mb-6 whitespace-pre-wrap break-words">{{ idea.description }}</p>
      
      <div class="flex items-center space-x-4">
        <button
          @click="vote('UP')"
          :disabled="!user || votingState === 'UP'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50 relative',
            idea.userVote === 'UP' 
              ? 'bg-green-200 border-2 border-green-400 text-green-800'
              : 'bg-green-100 hover:bg-green-200',
            votingState === 'UP' ? 'scale-110 bg-green-300' : ''
          ]"
        >
          <span v-if="votingState === 'UP'" class="animate-spin">⏳</span>
          <span v-else>👍</span>
          <span class="font-medium">{{ idea.upvotes }}</span>
          <div v-if="votingState === 'UP'" class="absolute inset-0 rounded-full bg-green-200 animate-pulse"></div>
        </button>
        
        <button
          @click="vote('DOWN')"
          :disabled="!user || votingState === 'DOWN'"
          :class="[
            'flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50 relative',
            idea.userVote === 'DOWN' 
              ? 'bg-red-200 border-2 border-red-400 text-red-800'
              : 'bg-red-100 hover:bg-red-200',
            votingState === 'DOWN' ? 'scale-110 bg-red-300' : ''
          ]"
        >
          <span v-if="votingState === 'DOWN'" class="animate-spin">⏳</span>
          <span v-else>👎</span>
          <span class="font-medium">{{ idea.downvotes }}</span>
          <div v-if="votingState === 'DOWN'" class="absolute inset-0 rounded-full bg-red-200 animate-pulse"></div>
        </button>
      </div>
    </div>

    <!-- Section commentaires -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        Commentaires ({{ idea.comments.length }})
      </h2>
      
      <!-- Formulaire nouveau commentaire -->
      <form v-if="user" @submit.prevent="addComment" class="mb-6">
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ajouter un commentaire
          </label>
          <textarea
            v-model="newComment"
            maxlength="500"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Partagez votre avis sur cette idée..."
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ newComment.length }}/500 caractères</p>
        </div>
        <button
          type="submit"
          :disabled="!newComment.trim() || commenting"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ commenting ? 'Envoi...' : 'Envoyer' }}
        </button>
      </form>
      
      <div v-else class="mb-6 p-4 bg-gray-50 rounded-md text-center">
        <p class="text-gray-600 mb-2">Connectez-vous pour commenter</p>
        <NuxtLink to="/auth/signin" class="text-blue-600 hover:text-blue-800">
          Se connecter
        </NuxtLink>
      </div>
      
      <!-- Liste des commentaires -->
      <div class="space-y-4">
        <div
          v-for="comment in idea.comments"
          :key="comment.id"
          class="border-l-4 border-gray-200 pl-4 py-2"
        >
          <p class="text-gray-700 break-words whitespace-pre-wrap">{{ comment.content }}</p>
          <p class="text-xs text-gray-500 mt-1 break-words">
            Par {{ comment.author.name }} • {{ formatDate(comment.createdAt) }}
          </p>
        </div>
        
        <div v-if="idea.comments.length === 0" class="text-center py-8 text-gray-500">
          <p>Aucun commentaire pour le moment.</p>
          <p class="mt-1">Soyez le premier à donner votre avis !</p>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-12">
    <p class="text-gray-500">Idée non trouvée.</p>
    <button
      @click="$router.push('/')"
      class="mt-4 text-blue-600 hover:text-blue-800"
    >
      Retour à l'accueil
    </button>
  </div>
</template>

<script lang="ts" setup>
const { user } = useAuth()
const route = useRoute()
const ideaId = route.params.id as string

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
  }
  createdAt: string
}

interface Idea {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
  author: {
    id: string
    name: string
  }
  upvotes: number
  downvotes: number
  userVote: 'UP' | 'DOWN' | null
  comments: Comment[]
  createdAt: string
}

const idea = ref<Idea | null>(null)
const newComment = ref('')
const loading = ref(true)
const commenting = ref(false)
const votingState = ref<'UP' | 'DOWN' | null>(null)

const loadIdea = async () => {
  try {
    loading.value = true
    const data = await $fetch(`/api/ideas/${ideaId}`)
    idea.value = data as Idea
  } catch (error) {
    console.error('Erreur lors du chargement de l\'idée:', error)
    idea.value = null
  } finally {
    loading.value = false
  }
}

const vote = async (type: 'UP' | 'DOWN') => {
  if (!user.value) {
    await navigateTo('/auth/signin')
    return
  }
  
  if (!idea.value || votingState.value) return
  
  votingState.value = type
  
  try {
    const data = await $fetch(`/api/ideas/${ideaId}/vote`, {
      method: 'POST',
      body: { type }
    })
    
    idea.value.upvotes = data.upvotes
    idea.value.downvotes = data.downvotes
    idea.value.userVote = data.userVote
  } catch (error) {
    console.error('Erreur lors du vote:', error)
  } finally {
    // Délai pour permettre de voir l'animation
    setTimeout(() => {
      votingState.value = null
    }, 300)
  }
}

const addComment = async () => {
  if (!newComment.value.trim() || !idea.value) return
  
  try {
    commenting.value = true
    const data = await $fetch(`/api/ideas/${ideaId}/comments`, {
      method: 'POST',
      body: { content: newComment.value }
    })
    
    idea.value.comments.push(data as Comment)
    newComment.value = ''
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error)
  } finally {
    commenting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const statusIcon = computed(() => {
  if (!idea.value) return ''
  const icons = {
    PENDING: '⏳',
    APPROVED: '✅',
    REJECTED: '❌',
    IMPLEMENTED: '🚀'
  }
  return icons[idea.value.status] || '❓'
})

const statusLabel = computed(() => {
  if (!idea.value) return ''
  const labels = {
    PENDING: 'En attente de validation',
    APPROVED: 'Idée approuvée',
    REJECTED: 'Idée rejetée',
    IMPLEMENTED: 'Idée réalisée'
  }
  return labels[idea.value.status] || 'Statut inconnu'
})

const statusBadgeClass = computed(() => {
  if (!idea.value) return ''
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 border border-green-300',
    REJECTED: 'bg-red-100 text-red-800 border border-red-300',
    IMPLEMENTED: 'bg-blue-100 text-blue-800 border border-blue-300'
  }
  return classes[idea.value.status] || 'bg-gray-100 text-gray-800 border border-gray-300'
})

const statusGlowClass = computed(() => {
  if (!idea.value || idea.value.status === 'PENDING') return ''
  
  const glowClasses = {
    APPROVED: 'ring-2 ring-green-200 shadow-lg shadow-green-100',
    REJECTED: 'ring-2 ring-red-200 shadow-lg shadow-red-100',
    IMPLEMENTED: 'ring-2 ring-blue-200 shadow-lg shadow-blue-100'
  }
  return glowClasses[idea.value.status] || ''
})

const shouldShowStatusBadge = computed(() => {
  return idea.value && idea.value.status !== 'PENDING'
})

onMounted(() => {
  loadIdea()
})
</script>
