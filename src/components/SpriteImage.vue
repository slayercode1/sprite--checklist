<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ src: string; alt: string; lazy?: boolean }>()
const failed = ref(false)
</script>
<template><div class="sprite-image"><img v-if="!failed" :src="src" :alt="alt" width="320" height="320" :loading="lazy === false ? 'eager' : 'lazy'" :fetchpriority="lazy === false ? 'high' : 'auto'" @error="failed = true"><span v-else aria-hidden="true">?</span></div></template>
