<template>
  <div class="" v-if="assignment">
    <Back to="/instructor/courses" />
    <CustomHeader :title="assignment.title">
      <UButton
        v-if="assignment.id"
        @click="deleteAssignment(assignment.id)"
        color="rose"
        variant="outline"
        size="xs"
      >
        Delete Assignment
      </UButton>
    </CustomHeader>

    <p>
      {{ assignment.description }}
    </p>

    <section class="space-y-2">
      <div
        class="flex gap-4 flex-wrap items-center justify-between sticky top-0 p-2 dark:bg-[#121212] bg-white"
      >
        <h2 class="text-md font-semibold">Submissions</h2>
      </div>
      <div class="space-y-3 p-2">
        <div v-for="(student, index) in assignment.students" :key="index">
          <UCard>
            <div
              class="flex justify-between gap-4 items-center flex-wrap font-medium"
            >
              <div>
                <p class="capitalize">
                  {{ studentDetails[student.studentId]?.name || "Loading..." }}
                </p>
                <!-- <p>{{ studentDetails[student.studentId]?.email || "" }}</p> -->
              </div>
              <div class="flex gap-4 items-center">
                <span>
                  {{ formatDate(student.submittedAt) }}
                </span>
                <UButton
                  :to="student.url"
                  external
                  target="_blank"
                  label="Download"
                  variant="outline"
                  icon="material-symbols:download"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>
  </div>
  <Loading v-model="loading" />
</template>

<script lang="ts" setup>
import type { SubmittedAssignment, User } from "~/types";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

const db = useFirestore();
const notification = useNotification();
const router = useRouter();
const collectionName = "assignments";

const route = useRoute();
const user = useCurrentUser();
const loading = ref(false);
if (!user) {
  navigateTo("/login");
}

const id = route.params.id as string;
const assignmentRef = doc(db, collectionName, id);
const assignment = ref<SubmittedAssignment | null>(null);
const studentDetails = reactive<{ [key: string]: User | null }>({});
try {
  const docSnap = await getDoc(assignmentRef);

  if (docSnap.exists()) {
    assignment.value = {
      id: docSnap.id,
      ...docSnap.data(),
    } as SubmittedAssignment;

    if (assignment.value?.students) {
      for (const student of assignment.value.students) {
        getUserDetail(student.studentId).then((user) => {
          if (user) {
            studentDetails[student.studentId] = user;
          }
        });
      }
    }
  } else {
    back();
    notification({
      title: "Error",
      description: "No such document!",
      id: "error",
      type: "error",
    });
  }
} catch (err) {
  console.error("Error getting document:", err);
  notification({
    title: "Error",
    description: "An error occurred",
    id: "error",
    type: "error",
  });
}

async function deleteAssignment(assignmentId: string) {
  try {
    const docRef = doc(db, collectionName, assignmentId);
    loading.value = true;
    // Delete the document
    await deleteDoc(docRef);
    back();
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
function back() {
  history.length > 1 ? router.back() : navigateTo("/instructor/courses");
}

// getting the user detail from the studentId
async function getUserDetail(studentId: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", studentId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as User) : null;
  } catch (error) {
    console.error("Error getting user detail:", error);
    return null;
  }
}

// const unsubscribe = ref(() => {});

// onMounted(() => {
//   unsubscribe.value = onSnapshot(assignmentRef, (docSnap) => {
//     if (docSnap.exists()) {
//       assignment.value = {
//         id: docSnap.id,
//         ...docSnap.data(),
//       } as SubmittedAssignment;
//     } else {
//       console.log("No such document!");
//     }
//   });
// });
// // Remember to unsubscribe from the snapshot when the component is unmounted
// onUnmounted(() => {
//   unsubscribe.value();
// });
</script>

<style></style>
