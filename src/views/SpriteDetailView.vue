<script setup lang="ts">
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import rawSprites from '../data/sprites.json'
import type { Sprite } from '../types/sprite'
import { titleCase } from '../utils/text'
import { useSpriteCollection } from '../composables/useSpriteCollection'
import { localizeSpriteName } from '../utils/spriteNames'
import InfoRow from '../components/InfoRow.vue'; import RarityBadge from '../components/RarityBadge.vue'; import SpriteImage from '../components/SpriteImage.vue'; import StatusBadge from '../components/StatusBadge.vue'
const route = useRoute(), sprites = rawSprites as Sprite[]
const sprite = computed(() => sprites.find((item) => item.slug === route.params.slug))
const { isOwned, isMastered, toggleOwned, toggleMastered } = useSpriteCollection()
watchEffect(() => { document.title = sprite.value ? `${localizeSpriteName(sprite.value.name)} — Sprite Checklist` : 'Sprite introuvable — Sprite Checklist' })
onBeforeUnmount(() => { document.title = 'Sprite Checklist' })
</script>
<template><main class="page-shell detail-page"><RouterLink class="back-link" to="/"><ArrowLeft :size="18" />Tous les Sprites</RouterLink>
  <template v-if="sprite"><section class="detail-hero"><SpriteImage :src="sprite.image" :alt="localizeSpriteName(sprite.name)" :lazy="false" /><p class="eyebrow">Sprite</p><h1>{{ localizeSpriteName(sprite.name) }}</h1><div class="detail-tags"><RarityBadge :rarity="sprite.rarity" /><span v-if="sprite.variant" class="plain-badge">{{ titleCase(sprite.variant) }}</span></div><div class="status-row detail-status"><StatusBadge kind="owned" :active="isOwned(sprite.id)" @toggle="toggleOwned(sprite.id)" /><StatusBadge kind="mastered" :active="isMastered(sprite.id)" @toggle="toggleMastered(sprite.id)" /></div></section>
    <div class="detail-content"><section v-if="sprite.description" class="detail-section"><p class="eyebrow">Description</p><p class="description">{{ sprite.description }}</p></section><section class="detail-section"><p class="eyebrow">Informations</p><dl><InfoRow label="Type" :value="sprite.spriteType ? localizeSpriteName(sprite.spriteType) : undefined" /><InfoRow label="Variante" :value="sprite.variant ? titleCase(sprite.variant) : undefined" /><InfoRow label="Localisation" :value="sprite.location" /><InfoRow label="Coût d'invocation" :value="sprite.summonCost?.toLocaleString('fr-FR')" /><InfoRow label="Taux global" :value="sprite.percentage !== undefined ? `${sprite.percentage}%` : undefined" /></dl></section><section v-if="sprite.dropChances?.length" class="detail-section"><p class="eyebrow">Chances d'obtention</p><dl><InfoRow v-for="drop in sprite.dropChances" :key="drop.source" :label="drop.source" :value="typeof drop.chance === 'number' ? `${drop.chance}%` : drop.chance" /></dl></section><a class="source-link" :href="sprite.sourceUrl" target="_blank" rel="noopener noreferrer">Voir la source sur Fortnite.gg<ExternalLink :size="15" /></a></div>
  </template><section v-else class="empty-state"><h1>Sprite introuvable</h1><RouterLink class="primary-button" to="/">Retour à la collection</RouterLink></section>
</main></template>
