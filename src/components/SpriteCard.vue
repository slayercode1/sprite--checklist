<script setup lang="ts">
import type { Sprite } from '../types/sprite'
import RarityBadge from './RarityBadge.vue'
import SpriteImage from './SpriteImage.vue'
import StatusBadge from './StatusBadge.vue'
import { localizeSpriteName } from '../utils/spriteNames'
import { Badge } from '@/components/ui/badge'
defineProps<{ sprite: Sprite; owned: boolean; mastered: boolean }>()
defineEmits<{ toggleOwned: []; toggleMastered: [] }>()
</script>
<template>
  <article class="sprite-card" :class="{ unowned: !owned }">
    <RouterLink class="sprite-card-link" :to="`/sprite/${sprite.slug}`"><SpriteImage :src="sprite.image" :alt="sprite.name" /></RouterLink>
    <div class="card-body"><div class="card-heading"><RouterLink :to="`/sprite/${sprite.slug}`"><h2>{{ localizeSpriteName(sprite.name) }}</h2></RouterLink><div class="card-badges"><Badge v-if="sprite.releaseStatus === 'new'" class="new-badge">New</Badge><Badge v-if="sprite.releaseStatus === 'archived'" variant="secondary" class="plain-badge">Archivé</Badge><RarityBadge :rarity="sprite.rarity" /></div></div>
      <div class="status-row"><StatusBadge kind="owned" :active="owned" @toggle="$emit('toggleOwned')" /><StatusBadge kind="mastered" :active="mastered" @toggle="$emit('toggleMastered')" /></div>
    </div>
  </article>
</template>
