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
          :disabled="!user"
          :class="[
            'flex items-center space-x-1 px-2 py-1 rounded-full transition-colors flex-shrink-0 text-xs',
            user 
              ? 'bg-green-100 hover:bg-green-200' 
              : 'bg-gray-100 cursor-not-allowed opacity-60'
          ]"
        >
          <span>👍</span>
          <span class="font-medium">{{ idea.upvotes }}</span>
        </button>
        
        <button
          @click.stop="handleVote('DOWN')"
          :disabled="!user"
          :class="[
            'flex items-center space-x-1 px-2 py-1 rounded-full transition-colors flex-shrink-0 text-xs',
            user 
              ? 'bg-red-100 hover:bg-red-200' 
              : 'bg-gray-100 cursor-not-allowed opacity-60'
          ]"
        >
          <span>👎</span>
          <span class="font-medium">{{ idea.downvotes }}</span>
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

const truncatedDescription = computed(() => {
  const maxLength = 120
  return props.idea.description.length > maxLength 
    ? props.idea.description.substring(0, maxLength) + '...' 
    : props.idea.description
})

const handleVote = (type: 'UP' | 'DOWN') => {
  if (!props.user) {
    navigateTo('/auth/signin')
    return
  }
  emit('vote', props.idea.id, type)
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
