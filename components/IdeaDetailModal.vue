<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" @mousedown.self="$emit('close')">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
      <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-700" @click="$emit('close')">
        ✕
      </button>
      <h2 class="text-2xl font-bold mb-2">{{ idea.title }}</h2>
      <div class="text-gray-600 mb-4">{{ idea.description }}</div>
      <div class="flex items-center space-x-4 text-xs text-gray-400 mb-4">
        <span>Statut : <span class="font-semibold">{{ idea.status }}</span></span>
        <span>👍 {{ idea.likes }}</span>
        <span>👎 {{ idea.dislikes }}</span>
        <span>💬 {{ idea.commentsCount }}</span>
      </div>
      <div class="flex space-x-2 mb-6">
        <button
          v-for="status in statuses"
          :key="status.value"
          :disabled="idea.status === status.value || updating"
          @click="$emit('update-status', idea.id, status.value)"
          class="px-3 py-1 rounded text-xs font-medium border transition-colors"
          :class="{
            'bg-yellow-400 text-white': status.value === 'PENDING',
            'bg-green-500 text-white': status.value === 'APPROVED',
            'bg-red-500 text-white': status.value === 'REJECTED',
            'bg-blue-500 text-white': status.value === 'IMPLEMENTED',
            'opacity-50': idea.status === status.value || updating,
            'border-gray-300': true
          }"
        >
          {{ status.label }}
        </button>
      </div>
      <h3 class="font-semibold mb-2">Commentaires</h3>
      <div v-if="comments.length === 0" class="text-gray-400">Aucun commentaire.</div>
      <ul v-else class="space-y-2">
        <li v-for="comment in comments" :key="comment.id" class="bg-gray-50 rounded p-2">
          <div class="text-xs text-gray-500 mb-1">Par {{ comment.author?.name || 'Utilisateur' }} le {{ formatDate(comment.createdAt) }}</div>
          <div>{{ comment.content }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  idea: Object,
  statuses: Array,
  updating: Boolean
})
const emit = defineEmits(['close', 'update-status'])

const comments = ref([])

onMounted(async () => {
  const { data } = await useFetch(`/api/admin/ideas/${props.idea.id}/comments`)
  if (data.value) comments.value = data.value
})

function formatDate(date) {
  return new Date(date).toLocaleString('fr-FR')
}
</script>
