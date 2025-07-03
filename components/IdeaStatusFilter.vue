<template>
  <div class="flex items-center space-x-2">
    <span class="text-sm text-gray-600">Statut:</span>
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
      class="px-3 py-1 border border-gray-300 rounded-md text-sm"
    >
      <option value="ALL">Toutes</option>
      <option value="APPROVED">✅ Approuvées</option>
      <option value="REJECTED">❌ Rejetées</option>
      <option value="IMPLEMENTED">🚀 Réalisées</option>
    </select>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  modelValue: string
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
