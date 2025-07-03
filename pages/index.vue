<template>
  <div class="space-y-8">
    <!-- Formulaire de soumission -->
    <div v-if="user" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Proposer une nouvelle idée</h2>
      <form @submit.prevent="submitIdea" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Titre <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newIdea.title"
            type="text"
            maxlength="100"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Résumez votre idée en quelques mots..."
          />
          <p class="text-xs text-gray-500 mt-1">{{ newIdea.title.length }}/100 caractères</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="newIdea.description"
            maxlength="1000"
            required
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Décrivez votre idée en détail..."
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">{{ newIdea.description.length }}/1000 caractères</p>
        </div>
        
        <button
          type="submit"
          :disabled="!newIdea.title.trim() || !newIdea.description.trim() || submitting"
          class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Soumission...' : 'Soumettre l\'idée' }}
        </button>
      </form>
    </div>

    <div v-else class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
      <p class="text-blue-800 mb-4">Connectez-vous pour proposer une nouvelle idée</p>
      <NuxtLink to="/auth/signin" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
        Se connecter
      </NuxtLink>
    </div>

    <!-- Liste des idées -->
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Toutes les idées ({{ ideas.length }})</h2>
        <div class="flex items-center space-x-4">
          <select v-model="sortBy" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="popularity">Trier par popularité</option>
            <option value="recent">Plus récentes</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500">Chargement des idées...</p>
      </div>
      
      <div v-else class="grid gap-4">
        <div
          v-for="idea in sortedIdeas"
          :key="idea.id"
          class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push(`/idea/${idea.id}`)"
        >
          <h3 class="font-semibold text-lg mb-2">{{ idea.title }}</h3>
          <p class="text-gray-600 mb-2">{{ truncateText(idea.description, 150) }}</p>
          <p class="text-sm text-gray-500 mb-4">Par {{ idea.author.name }}</p>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button
                @click.stop="vote(idea.id, 'UP')"
                class="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
              >
                <span>👍</span>
                <span class="text-sm font-medium">{{ idea.upvotes }}</span>
              </button>
              
              <button
                @click.stop="vote(idea.id, 'DOWN')"
                class="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
              >
                <span>👎</span>
                <span class="text-sm font-medium">{{ idea.downvotes }}</span>
              </button>
            </div>
            
            <div class="flex items-center space-x-2 text-sm text-gray-500">
              <span>💬 {{ idea.commentsCount }} commentaires</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="!loading && ideas.length === 0" class="text-center py-12 text-gray-500">
        <p>Aucune idée n'a encore été soumise.</p>
        <p class="mt-2">Soyez le premier à partager votre idée !</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { user } = useAuth()

interface Idea {
  id: string
  title: string
  description: string
  author: {
    id: string
    name: string
  }
  upvotes: number
  downvotes: number
  commentsCount: number
  createdAt: string
}

const newIdea = ref({
  title: '',
  description: ''
})

const ideas = ref<Idea[]>([])
const sortBy = ref('popularity')
const loading = ref(true)
const submitting = ref(false)
const isAutoRefreshing = ref(false)
let intervalId: NodeJS.Timeout | null = null

const sortedIdeas = computed(() => {
  const sorted = [...ideas.value]
  if (sortBy.value === 'popularity') {
    return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
  } else {
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})

const loadIdeas = async (isAutoRefresh = false) => {
  try {
    if (isAutoRefresh) {
      isAutoRefreshing.value = true
    } else {
      loading.value = true
    }
    
    const data = await $fetch('/api/ideas')
    ideas.value = data as Idea[]
  } catch (error) {
    console.error('Erreur lors du chargement des idées:', error)
  } finally {
    if (isAutoRefresh) {
      isAutoRefreshing.value = false
    } else {
      loading.value = false
    }
  }
}

// Actualisation automatique transparente
const startAutoRefresh = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  
  intervalId = setInterval(() => {
    loadIdeas(true) // Actualisation transparente
  }, 5000) // 5 secondes
}

const submitIdea = async () => {
  if (!newIdea.value.title.trim() || !newIdea.value.description.trim()) return
  
  try {
    submitting.value = true
    const data = await $fetch('/api/ideas', {
      method: 'POST',
      body: {
        title: newIdea.value.title,
        description: newIdea.value.description
      }
    })
    
    ideas.value.unshift(data as Idea)
    newIdea.value = { title: '', description: '' }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
  } finally {
    submitting.value = false
  }
}

const vote = async (ideaId: string, type: 'UP' | 'DOWN') => {
  if (!user.value) {
    await navigateTo('/auth/signin')
    return
  }
  
  try {
    const data = await $fetch(`/api/ideas/${ideaId}/vote`, {
      method: 'POST',
      body: { type }
    })
    
    const idea = ideas.value.find(i => i.id === ideaId)
    if (idea) {
      idea.upvotes = data.upvotes
      idea.downvotes = data.downvotes
    }
  } catch (error) {
    console.error('Erreur lors du vote:', error)
  }
}

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

onMounted(() => {
  loadIdeas() // Chargement initial avec loading
  startAutoRefresh()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>