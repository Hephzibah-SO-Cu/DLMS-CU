<template>
  <div class="space-y-4">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
      <div v-for="course in courses" :key="course.id">
        <CourseCard :course="course" />
      </div>
    </div>
  </div>
  <div
    v-if="pending"
    class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4"
  >
    <div v-for="course in 6" :key="course">
      <USkeleton class="w-full h-[213px]" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { query, collection, orderBy, where } from "firebase/firestore";
  import type { Course } from "~/types";
  const db = useFirestore();
  const q = ref<any>(null);
  const { data: courses, pending, promise } = useCollection<Course>(q);
  const isOpen = ref(false);

  onMounted(() => {
    q.value = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  });
</script>

<style></style>
