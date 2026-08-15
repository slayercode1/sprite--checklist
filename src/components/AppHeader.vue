<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ displayed: number; total: number; owned: number; mastered: number }>()
const remaining = computed(() => Math.max(0, props.total - props.owned))
</script>
<template>
  <header class="app-header">
    <div class="page-shell header-content">
      <div class="header-title">
        <h1 class="eyebrow">Votre collection</h1>
        <p v-if="displayed !== total">{{ displayed }} Sprite{{ displayed > 1 ? 's' : '' }} affiché{{ displayed > 1 ? 's' : '' }} sur {{ total }}</p>
      </div>
      <dl class="collection-stats" aria-label="Progression de la collection">
        <div><dt>Total</dt><dd>{{ total }}</dd></div>
        <div><dt>Possédés</dt><dd>{{ owned }}</dd></div>
        <div><dt>Maîtrisés</dt><dd>{{ mastered }}</dd></div>
        <div><dt>Restants</dt><dd>{{ remaining }}</dd></div>
      </dl>
    </div>
  </header>
</template>
