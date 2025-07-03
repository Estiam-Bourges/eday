<template>
  <div
    :class="[
      'bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 cursor-pointer w-full max-w-full overflow-hidden relative',
      statusGlowClass
    ]"
    @click="$router.push(`/idea/${idea.id}`)"
  >
    <!-- Badge de statut -->
    <div v-if="shouldShowStatusBadge" class="absolute top-3 right-3">
      <div :class="statusBadgeClass" class="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium">
        <span>{{ statusIcon }}</span>
        <span>{{ statusLabel }}</span>
      </div>
    </div>

    <h3 class="font-semibold text-lg mb-2 break-words overflow-wrap-anywhere line-clamp-2 pr-20">
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

interface Props {
  idea: Idea
  user?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  vote: [ideaId: string, type: 'UP' | 'DOWN']
}>()

const votingState = ref<'UP' | 'DOWN' | null>(null)

const shouldShowStatusBadge = computed(() => {
  return props.idea.status !== 'PENDING'
})

const statusIcon = computed(() => {
  const icons = {
    PENDING: '⏳',
    APPROVED: '✅',
    REJECTED: '❌',
    IMPLEMENTED: '🚀'
  }
  return icons[props.idea.status] || '❓'
})

const statusLabel = computed(() => {
  const labels = {
    PENDING: 'En attente',
    APPROVED: 'Approuvée',
    REJECTED: 'Rejetée',
    IMPLEMENTED: 'Réalisée'
  }
  return labels[props.idea.status] || 'Inconnu'
})

const statusBadgeClass = computed(() => {
  const classes = {
    PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border border-red-200',
    IMPLEMENTED: 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  return classes[props.idea.status] || 'bg-gray-100 text-gray-800 border border-gray-200'
})

const statusGlowClass = computed(() => {
  if (props.idea.status === 'PENDING') return ''
  
  const glowClasses = {
    APPROVED: 'ring-2 ring-green-200 shadow-green-100',
    REJECTED: 'ring-2 ring-red-200 shadow-red-100',
    IMPLEMENTED: 'ring-2 ring-blue-200 shadow-blue-100'
  }
  return glowClasses[props.idea.status] || ''
})

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
