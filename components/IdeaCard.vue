<template>
  <div
    class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer w-full max-w-full overflow-hidden"
    @click="$router.push(`/idea/${idea.id}`)"
  >
    <h3 class="font-semibold text-lg mb-2 break-words overflow-wrap-anywhere line-clamp-2">
      {{ idea.title }}
    </h3>
    
    <p class="text-gray-600 mb-3 break-words overflow-wrap-anywhere line-clamp-3 text-sm leading-relaxed">
      {{ truncatedDescription }}
    </p>
    
    <p class="text-xs text-gray-500 mb-4 break-words overflow-wrap-anywhere">
      Par {{ idea.author.name }} • {{ formatDate(idea.createdAt) }}
    </p>
    
    <div class="flex items-center justify-between min-w-0">
      <div class="flex items-center space-x-3 min-w-0">
        <button
          @click.stop="handleVote('UP')"
          :disabled="!user || votingState === 'UP'"
          :class="[
            'flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 flex-shrink-0 text-xs relative',
            idea.userVote === 'UP' 
              ? 'bg-green-200 border-2 border-green-400 text-green-800'
              : user 
                ? 'bg-green-100 hover:bg-green-200' 
                : 'bg-gray-100 cursor-not-allowed opacity-60',
            votingState === 'UP' ? 'scale-110 bg-green-300' : ''
          ]"
        >
          <span v-if="votingState === 'UP'" class="animate-spin">⏳</span>
          <span v-else>👍</span>
          <span class="font-medium">{{ idea.upvotes }}</span>
          <div v-if="votingState === 'UP'" class="absolute inset-0 rounded-full bg-green-200 animate-pulse"></div>
        </button>
        
        <button
          @click.stop="handleVote('DOWN')"
          :disabled="!user || votingState === 'DOWN'"
          :class="[
            'flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 flex-shrink-0 text-xs relative',
            idea.userVote === 'DOWN' 
              ? 'bg-red-200 border-2 border-red-400 text-red-800'
              : user 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-gray-100 cursor-not-allowed opacity-60',
            votingState === 'DOWN' ? 'scale-110 bg-red-300' : ''
          ]"
        >
          <span v-if="votingState === 'DOWN'" class="animate-spin">⏳</span>
          <span v-else>👎</span>
          <span class="font-medium">{{ idea.downvotes }}</span>
          <div v-if="votingState === 'DOWN'" class="absolute inset-0 rounded-full bg-red-200 animate-pulse"></div>
        </button>
      </div>
      
      <div class="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
        <span>💬</span>
        <span>{{ idea.commentsCount }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
  userVote: 'UP' | 'DOWN' | null
  createdAt: string
}

interface Props {
  idea: Idea
  user?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  vote: [ideaId: string, type: 'UP' | 'DOWN']
}>()

const votingState = ref<'UP' | 'DOWN' | null>(null)

const truncatedDescription = computed(() => {
  const maxLength = 120
  return props.idea.description.length > maxLength 
    ? props.idea.description.substring(0, maxLength) + '...' 
    : props.idea.description
})

const handleVote = async (type: 'UP' | 'DOWN') => {
  if (!props.user || votingState.value) {
    if (!props.user) {
      navigateTo('/auth/signin')
    }
    return
  }
  
  votingState.value = type
  
  try {
    await emit('vote', props.idea.id, type)
  } finally {
    // Délai pour permettre de voir l'animation
    setTimeout(() => {
      votingState.value = null
    }, 300)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Il y a moins d\'1h'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  if (diffInHours < 48) return 'Hier'
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
