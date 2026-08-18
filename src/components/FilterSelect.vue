<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

defineProps<{ modelValue: string; options: { value: string; label: string }[]; placeholder: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <Select :model-value="modelValue" @update:model-value="emit('update:modelValue', String($event))">
    <SelectTrigger class="w-full border-0 bg-background text-xs shadow-none"><SelectValue :placeholder="placeholder" /></SelectTrigger>
    <SelectContent><SelectItem v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</SelectItem></SelectContent>
  </Select>
</template>
