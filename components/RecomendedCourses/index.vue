<template>
  <section class="space-y-2">
    <h2 class="text-xl font-semibold">Recommended Courses</h2>
    <div>
      <div class="space-y-4">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4">
          <div v-for="course in recommendedcourses" :key="course.id">
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
    </div>
  </section>
</template>

<script lang="ts" setup>
import { query, collection, orderBy, getDocs } from "firebase/firestore";
import type { Course } from "~/types";
const db = useFirestore();
const courses = ref<Course[]>([]);
const recommendedcourses = ref<Course[]>([]);
const pending = ref(false);
const props = defineProps<{ keywords: string, courseId: string }>();

try {
  pending.value = true;
  const result = await getDocs(
    query(collection(db, "courses"), orderBy("createdAt", "desc"))
  );
  if (result.empty) {
    courses.value = [];
  } else {
    courses.value = result.docs.map((data) => {
      return {
        id: data.id,
        ...data.data(),
      } as Course;
    });
  }
} catch (error) {
  console.log(error);
} finally {
  pending.value = false;
}

const keywords = computed(() => {
  if (!props.keywords) return [];
  return props.keywords.split(",").map((keyword) => keyword.trim());
});

function filterCoursesByKeywords(courses: Course[], keywords: string[], excludeId: string) {
  return courses.filter(course => {
    if (course.id === excludeId) return false;
    if(!course.keywords) return false;
    const courseKeywords = course.keywords.split(",").map(kw => kw.trim());
    return keywords.some(keyword => courseKeywords.includes(keyword));
  });
}

recommendedcourses.value = filterCoursesByKeywords(courses.value, keywords.value, props.courseId);

</script>

<style></style>