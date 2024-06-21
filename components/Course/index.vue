<template>
  <div class="space-y-4">
    <CustomHeader title="Courses">
      <UButton @click="isOpen = true" label="Add Course" />
    </CustomHeader>
    <UCard>
      <UTable
        @select="select"
        :rows="courses"
        :columns
        :loading="pending"
        :ui="{
          td: { base: 'max-w-[200px] truncate' },
        }"
      >
        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <template #description-data="{ row }">
          <span class="">
            {{ row.description }}
          </span>
        </template>
        <template #title-data="{ row }">
          <span class="capitalize">
            {{ row.title }}
          </span>
        </template>

        <template #role-data="{ row }">
          <span class="capitalize">
            {{ row.role }}
          </span>
        </template>
      </UTable>
    </UCard>
    <CourseModal v-model:is-open="isOpen" />
  </div>
</template>

<script lang="ts" setup>
import { query, collection, orderBy, where } from "firebase/firestore";
import type { Course } from "~/types";
const db = useFirestore();
const q = ref<any>(null);
const user = useCurrentUser();
const notification = useNotification();
const { data: courses, pending, error } = useCollection<Course>(q);
const isOpen = ref(false);
const columns = [
  {
    key: "title",
    label: "Title",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "description",
    label: "Description",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "createdAt",
    label: "Created At ",
    sortable: true,
    direction: "desc" as const,
  },
];

if (error.value) {
  notification({
    title: "Error",
    description: error.value,
    type: "error",
    id: "error",
  });
}

function select(course: Course) {
  // open to a new page
  navigateTo(`/instructor/courses/${course.id}`);
  return;
}

// Delay Firebase access until the component is mounted
onMounted(() => {
  q.value = query(
    collection(db, "courses"),
    where("instructorId", "==", user.value?.uid!),
    orderBy("createdAt", "desc")
  );
});
</script>

<style></style>
