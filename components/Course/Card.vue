<template>
  <UCard
    class="flex flex-col flex-1 h-full"
    :ui="{
      body: { base: 'flex-1' },
      ring: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
    }"
  >
    <div class="flex flex-col justify-between h-full gap-4">
      <p class="text-2xl font-semibold truncates line-clamp-2 uppercase">
        {{ course.title }}
      </p>
      <p class="text-sm truncates line-clamp-2">
        {{ course.description }}
      </p>
    </div>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <div>
          <UButton :to="`/courses/${course.id}`" label="view" />
        </div>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { Course } from "~/types";

const props = defineProps<{
  course: Course;
}>();
</script>

<style></style>