<script setup lang="ts">
import type { Sprite } from '../types/sprite'
import RarityBadge from './RarityBadge.vue'
import SpriteImage from './SpriteImage.vue'
import StatusBadge from './StatusBadge.vue'
defineProps<{ sprite: Sprite; owned: boolean; mastered: boolean }>()
defineEmits<{ toggleOwned: []; toggleMastered: [] }>()
</script>
<template>
  <article class="sprite-card" :class="{ unowned: !owned }">
    <RouterLink class="sprite-card-link" :to="`/sprite/${sprite.slug}`"><SpriteImage :src="sprite.image" :alt="sprite.name" /></RouterLink>
    <div class="card-body"><div class="card-heading"><RouterLink :to="`/sprite/${sprite.slug}`"><h2>{{ sprite.name }}</h2></RouterLink><RarityBadge :rarity="sprite.rarity" /></div>
      <div class="status-row"><StatusBadge kind="owned" :active="owned" @toggle="$emit('toggleOwned')" /><StatusBadge kind="mastered" :active="mastered" @toggle="$emit('toggleMastered')" /></div>
    </div>
  </article>
</template>
