<script setup lang="ts">
import { rarityStyle } from '../config/rarities'
import { titleCase } from '../utils/text'
import { Badge } from '@/components/ui/badge'
defineProps<{ rarity?: string }>()
</script>
<template><Badge v-if="rarity" class="rarity-badge" :style="rarityStyle(rarity)">{{ titleCase(rarity) }}</Badge></template>
