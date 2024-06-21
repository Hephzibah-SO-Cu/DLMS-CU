<template>
  <div v-if="course" class="space-y-2">
    <Back to="/instructor/courses/enrolled-courses"/>
    <CustomHeader :title="course.title" />
    <p class="text-md text-gray-500">{{ course.description }}</p>

    <section class="pt-4 space-y-4">
      <h3 class="text-2xl font-semibold">Enrolled Students</h3>
      <UCard>
        <UTable
          :rows="students"
          :loading
          :columns
          :ui="{
            td: { base: 'max-w-[200px] truncate' },
          }"
        >
          <template #id-data="{ row }"> 1 </template>
          <template #name-data="{ row }">
            <p class="capitalize">{{ row.name }}</p>
          </template>

          <template #createdAt-data="{ row }">
            {{ formatDate(row.enrolledAt) }}
          </template>
          <template #action-data="{ row }">
            <UButton
              label="Un-Enroll"
              color="rose"
              @click="unenrollCourse(course.id, row.id)"
            />
          </template>
        </UTable>
      </UCard>
      <UModal v-model="deleting" :prevent-close="deleting" />
    </section>
  </div>
</template>

<script lang="ts" setup>
import {
  doc,
  collection,
  getDoc,
  type DocumentData,
  type DocumentReference,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import type { Course, EnrolledCourse, EnrolledStudent, User } from "~/types";

const route = useRoute();
const db = useFirestore();
const params = route.params;
const id = params.id as string;
const loading = ref(false);
const deleting = ref(false);

// get course doc in collections courses
const courseQuery = computed<DocumentReference<DocumentData, DocumentData>>(
  () => doc(collection(db, "courses"), id)
);
const { data: course } = useDocument<Course>(courseQuery);

// Fetch the enrolled course document based on the course id
const enrollCourseQuery = computed<
  DocumentReference<DocumentData, DocumentData>
>(() => doc(collection(db, "enrolledcourses"), id));

const { data: enrollcourse, promise: enrollcoursePromise } =
  useDocument<EnrolledCourse>(enrollCourseQuery);

// Fetch the list of students based on the studentId in enrolled course document
const students = ref<EnrolledStudent[]>([]);
await enrollcoursePromise.value;
if (enrollcourse.value?.students) {
  enrollcourse.value.students.forEach(async (student) => {
    const studentQuery = doc(collection(db, "users"), student.studentId);
    const { data, promise, pending } = useDocument<User>(studentQuery);
    loading.value = pending.value;
    await promise.value;

    students.value.push({
      ...(data.value as User),
      enrolledAt: student.enrolledAt,
    });
    loading.value = pending.value;
  });
} else {
  console.error("User ID is missing");
}

const columns = [
  {
    label: "#",
    key: "id",
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    direction: "desc" as const,
  },
  {
    label: "Enrolled On",
    key: "createdAt",
  },
  {
    label: "Action",
    key: "action",
  },
];

async function unenrollCourse(courseId: string, studentId: string) {
  try {
    deleting.value = true;
    const courseDocRef = doc(db, "enrolledcourses", courseId);
    const courseDoc = await getDoc(courseDocRef);

    if (courseDoc.exists()) {
      const updatedStudentIds: string[] = courseDoc
        .data()
        .studentIds.filter((id: any) => id !== studentId);
      if (updatedStudentIds.length === 0) {
        // Remove document if no students enrolled
        await deleteDoc(courseDocRef);
      } else {
        // Update document with new studentIds array
        await updateDoc(courseDocRef, {
          studentIds: updatedStudentIds,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    deleting.value = false;
  }
}
</script>
