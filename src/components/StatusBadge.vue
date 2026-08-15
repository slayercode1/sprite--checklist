<script setup lang="ts">
import { Check, Star } from 'lucide-vue-next'
defineProps<{ active: boolean; kind: 'owned' | 'mastered' }>()
defineEmits<{ toggle: [] }>()
</script>
<template>
  <button class="status-badge" :class="{ active }" type="button" :aria-pressed="active" @click.stop="$emit('toggle')">
    <component :is="kind === 'owned' ? Check : Star" :size="15" aria-hidden="true" />
    {{ active ? (kind === 'owned' ? 'Possédé' : 'Maîtrisé') : (kind === 'owned' ? 'Non possédé' : 'Non maîtrisé') }}
  </button>
</template>
