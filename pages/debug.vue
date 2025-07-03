<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-xl font-bold mb-4">Debug Authentification</h1>
      
      <div class="space-y-4">
        <div>
          <strong>Utilisateur connecté:</strong>
          <pre class="bg-gray-100 p-2 mt-2 rounded">{{ JSON.stringify(user, null, 2) }}</pre>
        </div>
        
        <div>
          <button @click="testAuth" class="bg-blue-600 text-white px-4 py-2 rounded">
            Test Auth Debug
          </button>
        </div>
        
        <div v-if="debugInfo">
          <strong>Info Debug:</strong>
          <pre class="bg-gray-100 p-2 mt-2 rounded">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
        </div>
        
        <div>
          <button @click="testVote" class="bg-green-600 text-white px-4 py-2 rounded">
            Test Vote API
          </button>
        </div>
        
        <div v-if="voteResult">
          <strong>Résultat Vote:</strong>
          <pre class="bg-gray-100 p-2 mt-2 rounded">{{ JSON.stringify(voteResult, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { user, debugAuth } = useAuth()

const debugInfo = ref(null)
const voteResult = ref(null)

const testAuth = async () => {
  debugInfo.value = await debugAuth()
}

const testVote = async () => {
  try {
    // Test avec une idée fictive
    const result = await $fetch('/api/ideas/test-id/vote', {
      method: 'POST',
      body: { type: 'UP' }
    })
    voteResult.value = result
  } catch (error) {
    voteResult.value = { error: error.data || error.message }
  }
}
</script>
