<template>
  <div class="space-y-4">
    <CustomHeader title="Enrolled Students" />
    <UCard>
      <UTable
        @select="select"
        :columns
        :loading
        :rows="enrolledCourses"
        :ui="{
          td: { base: 'max-w-[200px] truncate' },
        }"
      >
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import type { Course, EnrolledCourse, EnrolledStudent } from "~/types";
const user = useCurrentUser();
const enrolledCourses = ref<Course[]>([]);
const db = useFirestore();
const loading = ref(false);

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
    label: "Enrolled on",
    sortable: true,
    direction: "desc" as const,
  },
];

function select(course: Course) {
  // open to a new page
  // navigateTo(`/student/courses/${course.id}`);
  return;
}

async function fetchEnrolledCourses() {
  if (user.value?.uid) {
    enrolledCourses.value = await getEnrolledCourses(user.value.uid);
  }
}

async function getEnrolledCourses(instructorId: string) {
  loading.value = true;
  // Step 1: Get the enrolled courses IDs
  const enrolledCoursesQuery = query(
    collection(db, "enrolledcourses"),
    where("instructorId", "==", instructorId),
    orderBy("createdAt", "desc")
  );

  const enrolledCoursesSnapshot = await getDocs(enrolledCoursesQuery);
  const enrolledCourses = enrolledCoursesSnapshot.docs.map(
    (doc) => doc.data() as EnrolledCourse
  );

  // Step 2: Fetch the course details
  const coursePromises = enrolledCourses.map(async (enrollment) => {
    const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
    return courseDoc.exists()
      ? ({ ...courseDoc.data(), id: courseDoc.id } as Course)
      : null;
  });

  // Wait for all course details to be fetched
  const courses = await Promise.all(coursePromises);
  loading.value = false;
  // Filter out any null values
  return courses.filter((course) => course !== null) as Course[];
}

onMounted(fetchEnrolledCourses);
</script>
