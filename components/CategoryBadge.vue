<template>
  <span class="badge" :class="def.color">
    <span class="mr-1">{{ def.emoji }}</span>{{ def.label }}
  </span>
</template>

<script setup lang="ts">
import { categoryDef } from '~/utils/constants'

const props = defineProps<{ category: string }>()
const def = computed(() => categoryDef(props.category))
</script>
