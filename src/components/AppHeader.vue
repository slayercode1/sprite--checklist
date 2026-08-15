<script setup lang="ts">
defineProps<{ displayed: number }>()
</script>
<template>
  <header class="app-header">
    <div class="page-shell header-content">
      <div class="header-title">
        <h1 class="eyebrow">Votre collection</h1>
        <p>{{ displayed }} Sprite{{ displayed > 1 ? 's' : '' }} affiché{{ displayed > 1 ? 's' : '' }}</p>
      </div>
    </div>
  </header>
</template>
