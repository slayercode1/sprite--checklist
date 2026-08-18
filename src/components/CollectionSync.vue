<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronDown, CloudOff, Copy, RefreshCw, Unplug } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { SyncStatus } from '../composables/useCollectionSync'

const props = defineProps<{ status: SyncStatus; configured: boolean; syncCode: string }>()
const emit = defineEmits<{ sync: []; importCode: [code: string]; removeCode: [] }>()
const importedCode = ref('')
const copied = ref(false)
const label = computed(() => {
  if (props.syncCode) return 'Sync activée'
  if (props.status === 'syncing') return 'Activation…'
  return 'Activer la sync'
})

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
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button class="sync-button" :class="{ linked: syncCode }" variant="secondary" :disabled="!configured" @click="emit('sync')">
        <RefreshCw :class="{ spinning: status === 'syncing' && !syncCode }" aria-hidden="true" />{{ label }}<ChevronDown class="sync-chevron" aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="sync-dropdown w-[min(390px,calc(100vw-24px))] p-2">
      <DropdownMenuLabel><span class="eyebrow">Sauvegarde</span><strong>Synchronisation</strong></DropdownMenuLabel>
      <p v-if="!configured" class="sync-description">Ajoutez les variables Supabase au déploiement pour activer cette fonction.</p>
      <template v-else-if="syncCode">
        <p class="sync-description">Gardez ce code secret. Saisissez-le sur un autre appareil pour retrouver la même collection.</p>
        <div class="sync-code"><code>{{ syncCode }}</code><Button variant="ghost" size="icon" :aria-label="copied ? 'Code copié' : 'Copier le code'" @click.stop="copyCode"><Check v-if="copied" /><Copy v-else /></Button></div>
        <DropdownMenuItem variant="destructive" @select="emit('removeCode')"><Unplug />Retirer ce code de l’appareil</DropdownMenuItem>
      </template>
      <DropdownMenuSeparator />
      <form class="sync-form" @click.stop @keydown.stop @submit.prevent="importCode">
        <label for="sync-code">Utiliser un code existant</label>
        <div class="sync-import"><Input id="sync-code" v-model="importedCode" autocomplete="off" placeholder="Code secret" required /><Button type="submit" variant="secondary">Importer</Button></div>
      </form>
      <p v-if="status === 'offline'" class="sync-message"><CloudOff />Les changements restent sur cet appareil et seront envoyés au retour du réseau.</p>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
