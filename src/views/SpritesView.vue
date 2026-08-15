<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'
import rawSprites from '../data/sprites.json'
import type { Sprite, ViewMode } from '../types/sprite'
import { useLocalStorage } from '../composables/useLocalStorage'
import { useSpriteCollection } from '../composables/useSpriteCollection'
import { useSpriteFilters } from '../composables/useSpriteFilters'
import AppHeader from '../components/AppHeader.vue'; import FilterSidebar from '../components/FilterSidebar.vue'; import SpriteCard from '../components/SpriteCard.vue'; import SpriteListItem from '../components/SpriteListItem.vue'
const sprites = computed(() => rawSprites as Sprite[])
const viewMode = useLocalStorage<ViewMode>('sprite-checklist:view', 'grid')
const { isOwned, isMastered, toggleOwned, toggleMastered } = useSpriteCollection()
const filters = useSpriteFilters(sprites, isOwned, isMastered)
const filtersOpen = ref(false)
</script>
<template><a class="skip-link" href="#collection">Aller à la collection</a><AppHeader :displayed="filters.filteredSprites.value.length" /><main id="collection" class="page-shell collection-page">
  <button class="mobile-filter-button" type="button" :aria-expanded="filtersOpen" @click="filtersOpen = true"><SlidersHorizontal :size="19" aria-hidden="true" />Recherche et filtres</button>
  <div class="collection-layout"><FilterSidebar :open="filtersOpen" :query="filters.query.value" :view-mode="viewMode" :status="filters.status.value" :rarity="filters.rarity.value" :variant="filters.variant.value" :sprite-type="filters.spriteType.value" :sort="filters.sort.value" :rarities="filters.rarities.value" :variants="filters.variants.value" :sprite-types="filters.spriteTypes.value" @close="filtersOpen = false" @reset="filters.reset" @update:query="filters.query.value = $event" @update:view-mode="viewMode = $event" @update:status="filters.status.value = $event as typeof filters.status.value" @update:rarity="filters.rarity.value = $event" @update:variant="filters.variant.value = $event" @update:sprite-type="filters.spriteType.value = $event" @update:sort="filters.sort.value = $event as typeof filters.sort.value" />
    <div class="collection-results"><section v-if="filters.filteredSprites.value.length" :class="viewMode === 'grid' ? 'sprite-grid' : 'sprite-list'" :aria-label="`${filters.filteredSprites.value.length} Sprites`"><component :is="viewMode === 'grid' ? SpriteCard : SpriteListItem" v-for="sprite in filters.filteredSprites.value" :key="sprite.id" :sprite="sprite" :owned="isOwned(sprite.id)" :mastered="isMastered(sprite.id)" @toggle-owned="toggleOwned(sprite.id)" @toggle-mastered="toggleMastered(sprite.id)" /></section>
    <section v-else class="empty-state"><h2>Aucun Sprite trouvé.</h2><p>Modifiez votre recherche ou vos filtres.</p><button class="primary-button" @click="filters.reset">Réinitialiser les filtres</button></section></div>
  </div>
</main></template>
