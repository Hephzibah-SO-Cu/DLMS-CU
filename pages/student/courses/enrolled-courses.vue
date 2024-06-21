<template>
  <div class="space-y-4">
    <CustomHeader title="Enrolled Courses" />
    <UCard>
      <UTable
        @select="select"
        :columns
        :loading="pending"
        :rows="enrolledCourses"
        :ui="{
          td: { base: 'max-w-[200px] truncate' },
        }"
      >
        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
        <template #title-data="{ row }">
          <span class="uppercase">
            {{ row.title }}
          </span>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import {
  collection,
  query,
  where,
  orderBy,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import type { Course, EnrolledCourse } from "~/types";
const user = useCurrentUser();
const db = useFirestore();

const columns = [
  {
    key: "title",
    label: "Title",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "createdAt",
    label: "Enrolled on",
    sortable: true,
    direction: "desc" as const,
  },
];

function select(course: Course) {
  // open to a new page
  navigateTo(`/student/courses/${course.id}`);
  return;
}

const enrolledCoursesQuery = ref<Query<DocumentData> | null>(null);

const { data: enrolledCourses, pending } =
  useCollection<EnrolledCourse>(enrolledCoursesQuery);

onMounted(() => {
  if (user.value) {
    enrolledCoursesQuery.value = query(
      collection(db, "enrolledcourses"),
      where("studentIds", "array-contains", user.value.uid),
      orderBy("createdAt", "desc")
    );
  }
});
</script>
