<template>
  <div class="flex justify-between items-center">
    <h1 class="md:text-4xl font-bold uppercase text-2xl">{{ title }}</h1>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
}>()

</script>

<style></style>