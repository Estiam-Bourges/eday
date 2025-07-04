<template>
  <div>
    <h1>Administration</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span class="text-2xl font-bold">{{ stats.users }}</span>
        <span class="text-gray-500 mt-2">Utilisateurs</span>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span class="text-2xl font-bold">{{ stats.ideas }}</span>
        <span class="text-gray-500 mt-2">Idées</span>
      </div>
      <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center">
        <span class="text-2xl font-bold">{{ stats.votes }}</span>
        <span class="text-gray-500 mt-2">Votes</span>
      </div>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Liste des idées</h2>
      <div class="flex flex-wrap gap-4 items-center">
        <select v-model="selectedStatus" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
          <option value="">Tous les statuts</option>
          <option v-for="status in statuses" :key="status.value" :value="status.value">
            {{ status.filterLabel }}
          </option>
        </select>
        <select v-model="sortBy" class="px-3 py-1 border border-gray-300 rounded-md text-sm">
          <option value="popular">Trier par popularité</option>
          <option value="recent">Plus récentes</option>
        </select>
      </div>
    </div>

    <div v-if="filteredIdeas.length === 0" class="text-gray-500">Aucune idée à afficher.</div>
    <div v-else class="space-y-4">
      <div v-for="idea in filteredIdeas" :key="idea.id" class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex-1 cursor-pointer" @click="openIdea(idea)">
          <div class="font-bold text-lg mb-1">{{ idea.title }}</div>
          <div class="text-gray-600 mb-2 line-clamp-2">{{ idea.description }}</div>
          <div class="flex items-center space-x-4 text-xs text-gray-400 mt-2">
            <span>Statut : <span class="font-semibold">{{ idea.status }}</span></span>
            <span>👍 {{ idea.likes }}</span>
            <span>👎 {{ idea.dislikes }}</span>
            <span>💬 {{ idea.commentsCount }}</span>
          </div>
        </div>
        <div class="flex space-x-2 mt-4 md:mt-0">
          <button
            v-for="status in statuses"
            :key="status.value"
            :disabled="idea.status === status.value || updating[idea.id]"
            @click.stop="updateStatus(idea.id, status.value)"
            class="px-3 py-1 rounded text-xs font-medium border transition-colors"
            :class="{
              'bg-yellow-400 text-white': status.value === 'PENDING',
              'bg-green-500 text-white': status.value === 'APPROVED',
              'bg-red-500 text-white': status.value === 'REJECTED',
              'bg-blue-500 text-white': status.value === 'IMPLEMENTED',
              'opacity-50': idea.status === status.value || updating[idea.id],
              'border-gray-300': true
            }"
          >
            {{ status.label }}
          </button>
        </div>
      </div>
    </div>

    <IdeaDetailModal
      v-if="selectedIdea"
      :idea="selectedIdea"
      :statuses="statuses"
      :updating="updating[selectedIdea.id]"
      @close="selectedIdea = null"
      @update-status="updateStatus"
    />
  </div>
</template>

<script setup>
import IdeaDetailModal from '~/components/IdeaDetailModal.vue'

definePageMeta({
  middleware: 'auth',
  requiresAdmin: true,
  title: 'Administration'
})

const stats = ref({ users: 0, ideas: 0, votes: 0 })
const ideas = ref([])
const updating = ref({})
const selectedIdea = ref(null)
const selectedStatus = ref('')
const sortBy = ref('recent')
const statuses = [
  { value: 'PENDING', label: 'À réviser', filterLabel: 'À réviser' },
  { value: 'APPROVED', label: 'Approuvée', filterLabel: 'Approuvées' },
  { value: 'REJECTED', label: 'Rejetée', filterLabel: 'Rejetées' },
  { value: 'IMPLEMENTED', label: 'Réalisée', filterLabel: 'Réalisées' }
]

onMounted(async () => {
  const [{ data: statsData }, { data: ideasData }] = await Promise.all([
    useFetch('/api/admin/stats'),
    useFetch('/api/admin/ideas')
  ])
  if (statsData.value) stats.value = statsData.value
  if (ideasData.value) ideas.value = ideasData.value
})

const filteredIdeas = computed(() => {
  let arr = ideas.value
  if (selectedStatus.value) {
    arr = arr.filter(i => i.status === selectedStatus.value)
  }
  if (sortBy.value === 'popular') {
    arr = [...arr].sort((a, b) => (b.likes - a.likes))
  } else {
    arr = [...arr].sort((a, b) => (b.createdAt && a.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0))
  }
  return arr
})

function openIdea(idea) {
  selectedIdea.value = idea
}

async function updateStatus(id, status) {
  updating.value[id] = true
  try {
    const { data, error } = await useFetch(`/api/admin/ideas/${id}/status`, {
      method: 'POST',
      body: { status }
    })
    if (!error.value && data.value) {
      const idx = ideas.value.findIndex(i => i.id === id)
      if (idx !== -1) ideas.value[idx].status = status
    }
  } finally {
    updating.value[id] = false
  }
}
</script>


