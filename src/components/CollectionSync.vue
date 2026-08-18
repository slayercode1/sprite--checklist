<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, CloudOff, Copy, RefreshCw, X } from 'lucide-vue-next'
import type { SyncStatus } from '../composables/useCollectionSync'

const props = defineProps<{ status: SyncStatus; configured: boolean; syncCode: string }>()
const emit = defineEmits<{ sync: []; importCode: [code: string] }>()
const open = ref(false)
const importedCode = ref('')
const copied = ref(false)
const label = computed(() => ({ disabled: 'Activer la sync', idle: 'Synchroniser', syncing: 'Synchronisation…', offline: 'Hors ligne', synced: 'Synchronisé', conflict: 'Données récupérées', error: 'Réessayer' })[props.status])

async function copyCode() {
  await navigator.clipboard.writeText(props.syncCode)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1800)
}

function importCode() {
  emit('importCode', importedCode.value)
  importedCode.value = ''
}
</script>

<template>
  <div class="sync-control">
    <button class="sync-button" type="button" :disabled="status === 'syncing' || !configured" @click="emit('sync'); open = true">
      <RefreshCw :class="{ spinning: status === 'syncing' }" :size="16" aria-hidden="true" />{{ label }}
    </button>
    <button class="sync-settings-button" type="button" :disabled="!configured" aria-label="Paramètres de synchronisation" @click="open = !open">•••</button>
    <div v-if="open" class="sync-popover">
      <div class="sync-popover-heading"><strong>Synchronisation</strong><button type="button" aria-label="Fermer" @click="open = false"><X :size="17" /></button></div>
      <p v-if="!configured">Ajoutez les variables Supabase au déploiement pour activer cette fonction.</p>
      <template v-else-if="syncCode">
        <p>Gardez ce code secret. Saisissez-le sur un autre appareil pour retrouver la même collection.</p>
        <div class="sync-code"><code>{{ syncCode }}</code><button type="button" :aria-label="copied ? 'Code copié' : 'Copier le code'" @click="copyCode"><Check v-if="copied" :size="16" /><Copy v-else :size="16" /></button></div>
      </template>
      <form @submit.prevent="importCode">
        <label for="sync-code">Utiliser un code existant</label>
        <div class="sync-import"><input id="sync-code" v-model="importedCode" autocomplete="off" placeholder="Code secret" required /><button type="submit">Importer</button></div>
      </form>
      <p v-if="status === 'offline'" class="sync-message"><CloudOff :size="15" />Les changements restent sur cet appareil et seront envoyés au retour du réseau.</p>
    </div>
  </div>
</template>
