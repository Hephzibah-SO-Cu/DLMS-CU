<template>
  <Suspense>
    <div v-if="assessment">
     
      <AssessmentForInstructor :assessment />
    </div>
    <template #fallback> loading... </template>
  </Suspense>
</template>

<script lang="ts" setup>
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import type { Assessment } from "~/types";

const route = useRoute();
const user = useCurrentUser();
const db = useFirestore();

if (!user) {
  navigateTo("/login");
}

const id = route.params.id as string;
const assessmentRef = doc(db, "assessments", id);
const assessment = ref<Assessment | null>(null);
try {
  const docSnap = await getDoc(assessmentRef);

  if (docSnap.exists()) {
    assessment.value = {
      id: docSnap.id,
      ...docSnap.data(),
    } as Assessment;
  } else {
    console.log("No such document!");
  }
} catch (err) {
  console.error("Error getting document:", err);
}

const unsubscribe = ref(() => {});

onMounted(() => {
  unsubscribe.value = onSnapshot(assessmentRef, (docSnap) => {
    if (docSnap.exists()) {
      assessment.value = {
        id: docSnap.id,
        ...docSnap.data(),
      } as Assessment;
    } else {
      console.log("No such document!");
    }
  });
});
// Remember to unsubscribe from the snapshot when the component is unmounted
onUnmounted(() => {
  unsubscribe.value();
});


</script>

<style></style>
