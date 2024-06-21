<template>
  <div v-if="course" class="space-y-4">
    <Back to="/instructor/courses"/>
    <section class="space-y-3">
      <CustomHeader :title="course?.title">
        <div class="flex gap-4 flex-wrap justify-end">
          <UButton
            @click="isEditing = true"
            variant="soft"
            label="Edit Course"
          />
          <UButton
            @click="isDeleteOpen = true"
            variant="outline"
            color="rose"
            label="Delete Course"
          />
        </div>
      </CustomHeader>
      <div class="space-y-1">
        <p class="text-xl text-gray-400">About The Course</p>
        <p class="text-">{{ course.description }}</p>
      </div>
    </section>

    <UTabs :items="items">
      <template #assessment="{ item }">
        <Assessment :course-id="course.id!" :role="'instructor'" />
      </template>

      <template #resources="{ item }">
        <CourseResourses
          :course="course"
          :resources="courseresources"
          :pending
          role="instructor"
        />
      </template>

      <template #assignment="{ item }">
        <Assignment :course="course" role="instructor" />
      </template>
    </UTabs>

    <CourseModal v-model:is-open="isEditing" :course="course" />
    <UModal v-model="isDeleteOpen">
      <UCard>
        <template #header>
          <h3 class="text-xl font-semibold">Delete Course</h3>
        </template>
        <p>
          Are you sure you want to delete this course and all its resources?
          This action cannot be undone.
        </p>
        <template #footer>
          <div class="flex justify-end gap-4">
            <UButton
              @click="isDeleteOpen = false"
              variant="outline"
              label="Cancel"
            />
            <UButton
              color="rose"
              label="Delete"
              v-if="course"
              :loading="deleting"
              @click="deleteCourseAndResources(course.id)"
            />
          </div>
        </template>
      </UCard>
    </UModal>
    <Loading v-model="deleting" />
  </div>
</template>

<script lang="ts" setup>
import {
  query,
  collection,
  orderBy,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import type { Course, CourseResource, User } from "~/types";

const route = useRoute();
const router = useRouter();
const user = useCurrentUser();
const db = useFirestore();
const storage = useFirebaseStorage();
const notification = useNotification();

const courseResourcesQuery = ref<any>(null);
const isDeleteOpen = ref(false);
if (!user) {
  navigateTo("/login");
}
const id = route.params.id as string;

const deleting = ref(false);
const isEditing = ref(false);
const courseQuery = computed(() =>
  id ? doc(collection(db, "courses"), id) : null
);

const items = [
  {
    slot: "resources",
    label: "Course Resources",
  },
  {
    slot: "assessment",
    label: "Course Assessment",
  },
  {
    slot: "assignment",
    label: "Assignment",
  },
];
const { data: course } = useDocument<Course>(courseQuery);

const { data: courseresources, pending } =
  useCollection<CourseResource>(courseResourcesQuery);

onMounted(() => {
  if (user.value?.uid && course.value?.id) {
    courseResourcesQuery.value = query(
      collection(db, "courseresources"),
      where("instructorId", "==", user.value.uid),
      where("courseId", "==", course.value.id),
      orderBy("createdAt", "desc")
    );
  } else {
    // Handle the case where user.value?.uid or course.value?.id is undefined
  }
});

function back() {
  history.length > 1 ? router.back() : navigateTo("/instructor/courses");
}
async function deleteResource(resource: CourseResource) {
  try {
    deleting.value = true;
    // Delete the document from Firestore
    await deleteDoc(doc(collection(db, "courseresources"), resource.id));

    // Create a reference to the file in Firebase Storage
    const fileRef = storageRef(storage, `courses/${resource.storageId}`);

    // Delete the file from Firebase Storage
    await deleteObject(fileRef);

    notification({
      title: "Success",
      description: "Resource deleted successfully",
      id: "success",
      type: "success",
    });
  } catch (error) {
    console.log(error);
    notification({
      title: "Error",
      description: "An error occurred",
      id: "error",
      type: "error",
    });
  } finally {
    deleting.value = false;
  }
}

async function deleteCourseAndResources(courseId: string) {
  try {
    // Delete all resources of the course
    const resources = courseresources.value;
    resources.forEach(async (resource) => {
      await deleteResource(resource);
    });
    deleting.value = true;

    // Delete the course
    await deleteDoc(doc(collection(db, "courses"), courseId));

    back();
    notification({
      title: "Success",
      description: "Course and resources deleted successfully",
      id: "success",
      type: "success",
    });
  } catch (error) {
    console.log(error);
    notification({
      title: "Error",
      description: "An error occurred",
      id: "error",
      type: "error",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<style></style>
