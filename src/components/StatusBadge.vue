<script setup lang="ts">
import { Check, Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
defineProps<{ active: boolean; kind: 'owned' | 'mastered' }>()
defineEmits<{ toggle: [] }>()
</script>
<template>
  <Button variant="ghost" class="status-badge" :class="{ active }" :aria-pressed="active" @click.stop="$emit('toggle')">
    <component :is="kind === 'owned' ? Check : Star" :size="15" aria-hidden="true" />
    {{ active ? (kind === 'owned' ? 'Possédé' : 'Maîtrisé') : (kind === 'owned' ? 'Non possédé' : 'Non maîtrisé') }}
  </Button>
</template>
