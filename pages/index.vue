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
        <h2 class="text-xl font-semibold">Toutes les idées ({{ totalIdeas }})</h2>
        <div class="flex items-center space-x-4">
          <IdeaStatusFilter v-model="statusFilter" />
          
          <select v-model="itemsPerPage" @change="changeItemsPerPage(itemsPerPage)" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="9">9 par page</option>
            <option value="12">12 par page</option>
            <option value="15">15 par page</option>
          </select>
          
          <select v-model="sortBy" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option value="popularity">Trier par popularité</option>
            <option value="recent">Plus récentes</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in Number(itemsPerPage)" :key="i" class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Skeleton loader card -->
          <div class="p-4 space-y-4">
            <!-- Titre -->
            <div class="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
            
            <!-- Auteur -->
            <div class="h-4 bg-gray-100 rounded animate-pulse w-1/3"></div>
            
            <!-- Description -->
            <div class="space-y-2">
              <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
            </div>
            
            <!-- Votes et commentaires -->
            <div class="flex justify-between pt-4">
              <div class="flex space-x-2">
                <div class="h-8 w-16 bg-green-100 rounded-full animate-pulse"></div>
                <div class="h-8 w-16 bg-red-100 rounded-full animate-pulse"></div>
              </div>
              <div class="h-5 w-20 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <IdeaCard
          v-for="idea in ideas"
          :key="idea.id"
          :idea="idea"
          :user="user"
          @vote="handleVote"
        />
      </div>
      
      <!-- Pagination -->
      <div v-if="!loading && totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        
        <div class="flex space-x-1">
          <button
            v-for="page in getPaginationRange()"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-2 border rounded-md',
              page === currentPage 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>
      </div>
      
      <div v-if="!loading && totalPages > 1" class="text-center text-sm text-gray-500 mt-4">
        Page {{ currentPage }} sur {{ totalPages }} ({{ totalIdeas }} idées au total)
      </div>
      
      <div v-if="!loading && ideas.length === 0" class="text-center py-12 text-gray-500">
        <p>Aucune idée n'a encore été soumise.</p>
        <p class="mt-2">Soyez le premier à partager votre idée !</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({
  title: 'Accueil',
})

const { user } = useAuth()

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
  commentsCount: number
  userVote: 'UP' | 'DOWN' | null
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
const currentPage = ref(1)
const itemsPerPage = ref(9)
const totalIdeas = ref(0)
const totalPages = ref(0)
const statusFilter = ref('ALL')
let intervalId: NodeJS.Timeout | null = null

const loadIdeas = async (isAutoRefresh = false) => {
  try {
    if (isAutoRefresh) {
      isAutoRefreshing.value = true
    } else {
      loading.value = true
    }
    
    const data = await $fetch('/api/ideas', {
      query: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        sort: sortBy.value,
        status: statusFilter.value
      }
    })
    
    // L'API retourne un objet avec pagination
    ideas.value = data.ideas || []
    totalIdeas.value = data.total || 0
    totalPages.value = data.totalPages || 1
  } catch (error) {
    console.error('Erreur lors du chargement des idées:', error)
    // En cas d'erreur, initialiser avec des valeurs par défaut
    ideas.value = []
    totalIdeas.value = 0
    totalPages.value = 0
  } finally {
    if (isAutoRefresh) {
      isAutoRefreshing.value = false
    } else {
      loading.value = false
    }
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadIdeas()
  }
}

const changeItemsPerPage = (newLimit: number) => {
  itemsPerPage.value = newLimit
  currentPage.value = 1
  loadIdeas()
}

// Watcher pour recharger quand le tri ou le statut change
watch([sortBy, statusFilter], () => {
  currentPage.value = 1
  loadIdeas()
})

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
    
    newIdea.value = { title: '', description: '' }
    
    // Recharger la première page pour voir la nouvelle idée
    currentPage.value = 1
    loadIdeas()
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
  } finally {
    submitting.value = false
  }
}

const handleVote = async (ideaId: string, type: 'UP' | 'DOWN') => {
  try {
    const data = await $fetch(`/api/ideas/${ideaId}/vote`, {
      method: 'POST',
      body: { type }
    })
    
    const idea = ideas.value.find(i => i.id === ideaId)
    if (idea) {
      idea.upvotes = data.upvotes
      idea.downvotes = data.downvotes
      idea.userVote = data.userVote
    }
  } catch (error) {
    console.error('Erreur lors du vote:', error)
  }
}

const getPaginationRange = () => {
  const range = []
  const delta = 2 // Nombre de pages à afficher de chaque côté de la page actuelle
  
  for (let i = Math.max(1, currentPage.value - delta); 
       i <= Math.min(totalPages.value, currentPage.value + delta); 
       i++) {
    range.push(i)
  }
  
  return range
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