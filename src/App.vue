<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorNotifications from './components/ErrorNotifications.vue'
import { provideCollectionSync } from './composables/collectionSyncContext'
import { useCollectionSync } from './composables/useCollectionSync'
import { useSpriteCollection } from './composables/useSpriteCollection'

const { collection, replaceCollection } = useSpriteCollection()
provideCollectionSync(useCollectionSync(collection, replaceCollection))
</script>
<template><RouterView /><ErrorNotifications /></template>
