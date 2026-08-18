<script setup lang="ts">
import { Grid2X2, List, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StatusFilter } from '../composables/useSpriteFilters'
import { localizeSpriteType, localizeSpriteVariant } from '../utils/spriteNames'
import FilterSelect from './FilterSelect.vue'

defineProps<{
  open: boolean
  query: string
  viewMode: 'grid' | 'list'
  statuses: StatusFilter[]
  rarity: string
  variant: string
  spriteType: string
  sort: string
  rarities: string[]
  variants: string[]
  spriteTypes: string[]
}>()

const emit = defineEmits<{
  close: []
  reset: []
  'update:query': [value: string]
  'update:viewMode': [value: 'grid' | 'list']
  'update:statuses': [value: StatusFilter[]]
  'update:rarity': [value: string]
  'update:variant': [value: string]
  'update:spriteType': [value: string]
  'update:sort': [value: string]
}>()

const statusOptions = [
  { value: 'owned', label: 'Possédés' },
  { value: 'unowned', label: 'Non possédés' },
  { value: 'mastered', label: 'Maîtrisés' },
  { value: 'unmastered', label: 'Non maîtrisés' },
] satisfies { value: StatusFilter; label: string }[]

const oppositeStatus: Partial<Record<StatusFilter, StatusFilter>> = {
  owned: 'unowned', unowned: 'owned', mastered: 'unmastered', unmastered: 'mastered',
}

const sortOptions = [
  { value: 'az', label: 'Nom A-Z' }, { value: 'za', label: 'Nom Z-A' }, { value: 'rarity', label: 'Rareté' },
  { value: 'owned', label: 'Possédés en premier' }, { value: 'unowned', label: 'Non possédés en premier' }, { value: 'mastered', label: 'Maîtrisés en premier' },
]

function toggleStatus(statuses: StatusFilter[], status: StatusFilter) {
  if (statuses.includes(status)) return statuses.filter((item) => item !== status)
  return [...statuses.filter((item) => item !== oppositeStatus[status]), status]
}
</script>

<template>
  <aside class="filter-sidebar" :class="{ open }" aria-label="Filtres de collection">
    <div class="filter-sidebar-header">
      <div><SlidersHorizontal :size="18" aria-hidden="true" /><h2>Filtres</h2></div>
      <Button class="sidebar-close" variant="ghost" size="icon" aria-label="Fermer les filtres" @click="emit('close')"><X :size="20" aria-hidden="true" /></Button>
    </div>

    <label class="sidebar-search">
      <Search :size="18" aria-hidden="true" />
      <span class="visually-hidden">Rechercher</span>
      <Input :model-value="query" name="sprite-search" type="search" autocomplete="off" placeholder="Rechercher un Esprit…" class="filter-search-input" @update:model-value="emit('update:query', String($event))" />
    </label>

    <div class="sidebar-view">
      <span>Affichage</span>
      <div class="view-switcher">
        <Button variant="ghost" size="icon" :class="{ active: viewMode === 'grid' }" aria-label="Vue grille" :aria-pressed="viewMode === 'grid'" @click="emit('update:viewMode', 'grid')"><Grid2X2 :size="18" aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" :class="{ active: viewMode === 'list' }" aria-label="Vue liste" :aria-pressed="viewMode === 'list'" @click="emit('update:viewMode', 'list')"><List :size="19" aria-hidden="true" /></Button>
      </div>
    </div>

    <fieldset class="filter-group">
      <legend>Collection</legend>
      <Button variant="ghost" class="sidebar-option" :class="{ active: statuses.length === 0 }" :aria-pressed="statuses.length === 0" @click="emit('update:statuses', [])"><span>Tous</span><span class="option-dot" /></Button>
      <Button v-for="option in statusOptions" :key="option.value" variant="ghost" class="sidebar-option" :class="{ active: statuses.includes(option.value) }" :aria-pressed="statuses.includes(option.value)" @click="emit('update:statuses', toggleStatus(statuses, option.value))">
        <span>{{ option.label }}</span><span class="option-dot" />
      </Button>
    </fieldset>

    <div class="filter-group sidebar-selects">
      <label>Rareté<FilterSelect :model-value="rarity" placeholder="Toutes les raretés" :options="[{ value: 'all', label: 'Toutes les raretés' }, ...rarities.map((item) => ({ value: item, label: item }))]" @update:model-value="emit('update:rarity', $event)" /></label>
      <label>Variante<FilterSelect :model-value="variant" placeholder="Toutes les variantes" :options="[{ value: 'all', label: 'Toutes les variantes' }, ...variants.map((item) => ({ value: item, label: localizeSpriteVariant(item) }))]" @update:model-value="emit('update:variant', $event)" /></label>
      <label>Type<FilterSelect :model-value="spriteType" placeholder="Tous les types" :options="[{ value: 'all', label: 'Tous les types' }, ...spriteTypes.map((item) => ({ value: item, label: localizeSpriteType(item) }))]" @update:model-value="emit('update:spriteType', $event)" /></label>
      <label>Trier par<FilterSelect :model-value="sort" placeholder="Trier par" :options="sortOptions" @update:model-value="emit('update:sort', $event)" /></label>
    </div>

    <Button class="reset-filters" variant="ghost" @click="emit('reset')"><RotateCcw :size="16" aria-hidden="true" />Réinitialiser</Button>
  </aside>
  <Button v-if="open" class="sidebar-backdrop" variant="ghost" aria-label="Fermer les filtres" @click="emit('close')" />
</template>
