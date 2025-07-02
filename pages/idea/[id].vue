<template>
  <div v-if="idea" class="space-y-6">
    <!-- Bouton retour -->
    <button
      @click="$router.back()"
      class="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
    >
      <span>←</span>
      <span>Retour à la liste</span>
    </button>

    <!-- Détail de l'idée -->
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-4">{{ idea.title }}</h1>
      <p class="text-gray-700 mb-6 whitespace-pre-wrap">{{ idea.description }}</p>
      
      <div class="flex items-center space-x-4">
        <button
          @click="vote('up')"
          class="flex items-center space-x-2 px-4 py-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
        >
          <span>👍</span>
          <span class="font-medium">{{ idea.upvotes }}</span>
        </button>
        
        <button
          @click="vote('down')"
          class="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
        >
          <span>👎</span>
          <span class="font-medium">{{ idea.downvotes }}</span>
        </button>
      </div>
    </div>

    <!-- Section commentaires -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">
        Commentaires ({{ comments.length }})
      </h2>
      
      <!-- Formulaire nouveau commentaire -->
      <form @submit.prevent="addComment" class="mb-6">
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
          :disabled="!newComment.trim()"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </form>
      
      <!-- Liste des commentaires -->
      <div class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="border-l-4 border-gray-200 pl-4 py-2"
        >
          <p class="text-gray-700">{{ comment.content }}</p>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatDate(comment.createdAt) }}
          </p>
        </div>
        
        <div v-if="comments.length === 0" class="text-center py-8 text-gray-500">
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
interface Comment {
  id: number
  content: string
  createdAt: Date
}

interface Idea {
  id: number
  title: string
  description: string
  upvotes: number
  downvotes: number
  commentsCount: number
  createdAt: Date
}

const route = useRoute()
const ideaId = parseInt(route.params.id as string)

// Simulation des données (à remplacer par un appel API)
const idea = ref<Idea | null>({
  id: ideaId,
  title: "Créer un espace de coworking étudiant",
  description: "Il serait intéressant de créer un espace de coworking dédié aux étudiants avec des salles de réunion, des espaces silencieux pour étudier, et des zones de détente. Cet espace pourrait être ouvert 24h/24 et proposer des services comme l'impression, le wifi haut débit et même des distributeurs de café et snacks à prix étudiants.",
  upvotes: 15,
  downvotes: 2,
  commentsCount: 3,
  createdAt: new Date()
})

const comments = ref<Comment[]>([
  {
    id: 1,
    content: "Excellente idée ! Il manque vraiment ce type d'espace sur le campus.",
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 2,
    content: "Je suis d'accord, mais il faudrait aussi prévoir des casiers pour ranger nos affaires.",
    createdAt: new Date(Date.now() - 43200000)
  }
])

const newComment = ref('')

const vote = (type: 'up' | 'down') => {
  if (!idea.value) return
  
  if (type === 'up') {
    idea.value.upvotes++
  } else {
    idea.value.downvotes++
  }
}

const addComment = () => {
  if (!newComment.value.trim()) return
  
  const comment: Comment = {
    id: Date.now(),
    content: newComment.value.trim(),
    createdAt: new Date()
  }
  
  comments.value.push(comment)
  if (idea.value) {
    idea.value.commentsCount++
  }
  newComment.value = ''
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
