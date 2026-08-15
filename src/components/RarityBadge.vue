<script setup lang="ts">
import { rarityStyle } from '../config/rarities'
import { titleCase } from '../utils/text'
defineProps<{ rarity?: string }>()
</script>
<template><span v-if="rarity" class="rarity-badge" :style="rarityStyle(rarity)">{{ titleCase(rarity) }}</span></template>
