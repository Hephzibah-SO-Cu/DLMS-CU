<template>
  <div class="space-y-4">
    <CustomHeader title="Courses"> </CustomHeader>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
      <div v-for="course in courses" :key="course.id">
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
                <UButton
                  :to="`/student/courses/${course.id}`"
                  @click="isOpen = true"
                  label="view"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
  <UModal v-model="pending">
    <div class="p-4 text-center">
      <p>Fetching courses...</p>
    </div>
  </UModal>
</template>

<script lang="ts" setup>
import { query, collection, orderBy, where } from "firebase/firestore";
import type { Course } from "~/types";
const db = useFirestore();
const q = ref<any>(null);
const { data: courses, pending } = useCollection<Course>(q);
const isOpen = ref(false);

onMounted(() => {
  q.value = query(collection(db, "courses"), orderBy("createdAt", "desc"));
});
</script>

<style></style>
