<script setup lang="ts">defineProps<{ label: string; value?: string | number }>()</script>
<template><div v-if="value !== undefined && value !== ''" class="info-row"><dt>{{ label }}</dt><dd>{{ value }}</dd></div></template>
