<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { Sprite } from '../types/sprite'
import RarityBadge from './RarityBadge.vue'; import SpriteImage from './SpriteImage.vue'; import StatusBadge from './StatusBadge.vue'
defineProps<{ sprite: Sprite; owned: boolean; mastered: boolean }>()
defineEmits<{ toggleOwned: []; toggleMastered: [] }>()
</script>
<template><article class="sprite-list-item" :class="{ unowned: !owned }">
  <RouterLink :to="`/sprite/${sprite.slug}`"><SpriteImage :src="sprite.image" :alt="sprite.name" /></RouterLink><div class="list-name"><RouterLink :to="`/sprite/${sprite.slug}`"><h2>{{ sprite.name }}</h2></RouterLink><span>{{ sprite.variant }}</span></div><RarityBadge :rarity="sprite.rarity" />
  <div class="status-row"><StatusBadge kind="owned" :active="owned" @toggle="$emit('toggleOwned')" /><StatusBadge kind="mastered" :active="mastered" @toggle="$emit('toggleMastered')" /></div><RouterLink class="list-detail-link" :to="`/sprite/${sprite.slug}`" :aria-label="`Voir ${sprite.name}`"><ChevronRight class="chevron" :size="20" aria-hidden="true" /></RouterLink>
</article></template>
