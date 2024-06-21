<template>
  <div class="">
    <Back to="/instructor/courses" />
    <CustomHeader :title="assessment.title">
      <UButton
        v-if="assessment.id"
        @click="deleteAssessment(assessment.id)"
        color="rose"
        variant="outline"
        size="xs"
      >
        Delete Assessment
      </UButton>
    </CustomHeader>

    <section class="space-y-2">
      <div
        class="flex gap-4 flex-wrap items-center justify-between sticky top-0 p-2 dark:bg-[#121212] bg-white"
      >
        <h2 class="text-md font-semibold">Questions</h2>
        <div>
          <UButton @click="isOpen = true" size="xs">Add Question</UButton>
        </div>
      </div>
      <div class="space-y-3 p-2">
        <div v-for="(assessment, index) in assessment.questions" :key="index">
          <UCard>
            <template #header>
              <p class="text-xl">{{ index + 1 }} {{ assessment.question }}</p>
            </template>
            <div>
              <ul
                v-for="options in assessment.options"
                :key="options.option"
                class="list-disc pl-6"
              >
                <li
                  :class="[options.isCorrect ? 'text-primary' : 'text-red-400']"
                >
                  {{ options.option }}
                </li>
              </ul>
            </div>

            <template #footer>
              <div class="flex items-center justify-end gap-4">
                <UButton
                  @click="openQuestionModal(assessment)"
                  variant="outline"
                >
                  Update
                </UButton>
                <UButton @click="deleteQuestionModal(assessment)" color="rose">
                  Delete
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </section>
  </div>

  <AssessmentForInstructorQuestionModal v-model="isOpen" :question :isDelete />
</template>

<script lang="ts" setup>
import type { Assessment, Question } from "~/types";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

const db = useFirestore();
const notification = useNotification();
const router = useRouter();

const isOpen = ref(false);
const isDelete = ref(false);
defineProps<{ assessment: Assessment }>();

const question = ref<Question | undefined>(undefined);

function openQuestionModal(q: Question) {
  isOpen.value = true;
  question.value = q;
  isDelete.value = false;
}

function deleteQuestionModal(q: Question) {
  isOpen.value = true;
  isDelete.value = true;
  question.value = q;
}
async function updateAssessmentTitle(assessmentId: string, newTitle: string) {
  try {
    const docRef = doc(db, "assessments", assessmentId);

    // Update the title
    await updateDoc(docRef, {
      title: newTitle,
      updateAt: new Date().toISOString(),
    });

    notification({
      title: "Success",
      description: "Assessment title updated successfully",
      id: "success",
    });
  } catch (error) {
    console.log(error);
    notification({
      title: "Error",
      description: "An error occurred",
      id: "error",
      type: "error",
    });
  }
}

async function deleteAssessment(assessmentId: string) {
  try {
    const docRef = doc(db, "assessments", assessmentId);

    // Delete the document
    await deleteDoc(docRef);
    back();
    notification({
      title: "Success",
      description: "Assessment deleted successfully",
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
  }
}

function back() {
  history.length > 1 ? router.back() : navigateTo("/instructor/courses");
}

watch(isOpen, (newV) => {
  if (!newV) {
    question.value = undefined;
  }
});
</script>

<style></style>
