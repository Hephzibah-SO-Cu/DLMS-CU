<template>
  <section class="space-y-4">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <h3 class="capitalize lg:text-3xl font-semibold">Submit Assignment</h3>
      <div v-if="role === 'instructor'">
        <UButton @click="createAssignment" label="Create Assignment" />
      </div>
    </div>

    <div class="space-y-2">
      <div v-if="pending">
        <p>loading...</p>
      </div>
      <div v-else v-for="assignment in assignments" :key="assignment.id">
        <UCard>
          <div class="flex justify-between items-center">
            <p class="lg:text-2xl font-semibold truncate uppercase">
              {{ assignment.title }}
            </p>
            <div class="flex gap-4">
              <UButton
                variant="outline"
                @click="assignmentModal(assignment)"
                icon="ic:outline-remove-red-eye"
                v-if="isEnrolled || role === 'instructor'"
              />
              <UButton
                v-if="role === 'instructor'"
                @click="deleteAssignment(assignment.id!)"
                variant="outline"
                icon="carbon:trash-can"
                color="rose"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
    <Loading v-model="loading" />
    <AssignmentModal v-model="isOpen" :assignment :isCreate />
  </section>
</template>

<script lang="ts" setup>
import type { Assignment } from "~/types";
import {
  query,
  where,
  orderBy,
  collection,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
const db = useFirestore();
const props = defineProps<{
  pending?: boolean;
  role: "student" | "instructor";
  isEnrolled?: boolean;
}>();
const route = useRoute();
const courseId = route.params.id as string;
const user = useCurrentUser();
const collectionName = "assignments";
const notification = useNotification();
const loading = ref(false);
// const assignments = ref<Assignment[]>([
//   {
//     courseId: "avoYOljc9SNweOcaRXOH",
//     description: "This is the assignment description",
//     instructorId: "qRIRxASbMdbH0sfFtTlbHbJ5MDL2",
//     title: "Assignment 1",
//     id: "assignmentId123",
//   },
//   {
//     id: "1",
//     title: "Introduction to JavaScript",
//     description:
//       "This assignment covers the basics of JavaScript, including variables, data types, and basic functions.",
//     courseId: "course101",
//     instructorId: "instructorA",
//     createdAt: "2024-01-01T08:00:00Z",
//     updatedAt: "2024-01-01T08:00:00Z",
//   },
//   {
//     id: "2",
//     title: "Advanced CSS Techniques",
//     description:
//       "This assignment focuses on advanced CSS topics such as Flexbox, Grid Layout, and animations.",
//     courseId: "course102",
//     instructorId: "instructorB",
//     createdAt: "2024-01-05T10:00:00Z",
//     updatedAt: "2024-01-05T10:00:00Z",
//   },
//   {
//     id: "3",
//     title: "React Components and Props",
//     description:
//       "Learn how to create and manage React components, and understand how to pass data through props.",
//     courseId: "course103",
//     instructorId: "instructorC",
//     createdAt: "2024-01-10T09:00:00Z",
//     updatedAt: "2024-01-10T09:00:00Z",
//   },
//   {
//     id: "4",
//     title: "Node.js and Express",
//     description:
//       "Build a basic web server using Node.js and Express, and learn about routing and middleware.",
//     courseId: "course104",
//     instructorId: "instructorD",
//     createdAt: "2024-01-15T11:00:00Z",
//     updatedAt: "2024-01-15T11:00:00Z",
//   },
//   {
//     id: "5",
//     title: "Database Design and SQL",
//     description:
//       "Understand the principles of database design, and practice writing SQL queries for data manipulation.",
//     courseId: "course105",
//     instructorId: "instructorE",
//     createdAt: "2024-01-20T12:00:00Z",
//     updatedAt: "2024-01-20T12:00:00Z",
//   },
// ]);

const assignment = ref<Assignment | undefined>(undefined);

const isOpen = ref(false);
const isCreate = ref(false);
async function deleteAssignment(assignmentId: string) {
  try {
    const docRef = doc(db, collectionName, assignmentId);
    loading.value = true;
    // Delete the document
    await deleteDoc(docRef);
    notification({
      title: "Success",
      description: "Assignment deleted successfully",
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
    loading.value = false;
  }
}
const assignmentModal = (a: Assignment) => {
  props.role == "instructor" ? (isOpen.value = false) : (isOpen.value = true);
  assignment.value = a;
  props.role == "instructor"
    ? navigateTo(`/instructor/assignments/${a.id}`)
    : "";
};

const assignmentQuery = ref<any>(null);

const { data: assignments } = useCollection(assignmentQuery);

function createAssignment() {
  isOpen.value = true;
  isCreate.value = true;
}

onMounted(() => {
  const q = query(
    collection(db, "assignments"),
    where("courseId", "==", courseId),
    // where("instructorId", "==", user.value?.uid),
    orderBy("createdAt", "desc")
  );
  assignmentQuery.value = q;
});
</script>

<style></style>
