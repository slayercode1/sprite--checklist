<script setup lang="ts">
import { Grid2X2, List, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-vue-next'

defineProps<{
  open: boolean
  query: string
  viewMode: 'grid' | 'list'
  status: string
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
  'update:status': [value: string]
  'update:rarity': [value: string]
  'update:variant': [value: string]
  'update:spriteType': [value: string]
  'update:sort': [value: string]
}>()

const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'owned', label: 'Possédés' },
  { value: 'unowned', label: 'Non possédés' },
  { value: 'mastered', label: 'Maîtrisés' },
  { value: 'unmastered', label: 'Non maîtrisés' },
]
</script>

<template>
  <aside class="filter-sidebar" :class="{ open }" aria-label="Filtres de collection">
    <div class="filter-sidebar-header">
      <div><SlidersHorizontal :size="18" aria-hidden="true" /><h2>Filtres</h2></div>
      <button class="sidebar-close" type="button" aria-label="Fermer les filtres" @click="emit('close')"><X :size="20" aria-hidden="true" /></button>
    </div>

    <label class="sidebar-search">
      <Search :size="18" aria-hidden="true" />
      <span class="visually-hidden">Rechercher</span>
      <input :value="query" name="sprite-search" type="search" autocomplete="off" placeholder="Rechercher un Sprite…" @input="emit('update:query', ($event.target as HTMLInputElement).value)">
    </label>

    <div class="sidebar-view">
      <span>Affichage</span>
      <div class="view-switcher">
        <button type="button" :class="{ active: viewMode === 'grid' }" aria-label="Vue grille" :aria-pressed="viewMode === 'grid'" @click="emit('update:viewMode', 'grid')"><Grid2X2 :size="18" aria-hidden="true" /></button>
        <button type="button" :class="{ active: viewMode === 'list' }" aria-label="Vue liste" :aria-pressed="viewMode === 'list'" @click="emit('update:viewMode', 'list')"><List :size="19" aria-hidden="true" /></button>
      </div>
    </div>

    <fieldset class="filter-group">
      <legend>Collection</legend>
      <button v-for="option in statusOptions" :key="option.value" type="button" class="sidebar-option" :class="{ active: status === option.value }" :aria-pressed="status === option.value" @click="emit('update:status', option.value)">
        <span>{{ option.label }}</span><span class="option-dot" />
      </button>
    </fieldset>

    <div class="filter-group sidebar-selects">
      <label>Rareté<select :value="rarity" @change="emit('update:rarity', ($event.target as HTMLSelectElement).value)"><option value="all">Toutes les raretés</option><option v-for="item in rarities" :key="item">{{ item }}</option></select></label>
      <label>Variante<select :value="variant" @change="emit('update:variant', ($event.target as HTMLSelectElement).value)"><option value="all">Toutes les variantes</option><option v-for="item in variants" :key="item">{{ item }}</option></select></label>
      <label>Type<select :value="spriteType" @change="emit('update:spriteType', ($event.target as HTMLSelectElement).value)"><option value="all">Tous les types</option><option v-for="item in spriteTypes" :key="item">{{ item }}</option></select></label>
      <label>Trier par<select :value="sort" @change="emit('update:sort', ($event.target as HTMLSelectElement).value)"><option value="az">Nom A-Z</option><option value="za">Nom Z-A</option><option value="rarity">Rareté</option><option value="owned">Possédés en premier</option><option value="unowned">Non possédés en premier</option><option value="mastered">Maîtrisés en premier</option></select></label>
    </div>

    <button class="reset-filters" type="button" @click="emit('reset')"><RotateCcw :size="16" aria-hidden="true" />Réinitialiser</button>
  </aside>
  <button v-if="open" class="sidebar-backdrop" type="button" aria-label="Fermer les filtres" @click="emit('close')" />
</template>
