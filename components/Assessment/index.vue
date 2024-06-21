<template>
  <section class="space-y-4">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <h3 class="capitalize lg:text-3xl font-semibold">Course Assessments</h3>
      <div v-if="role === 'instructor'">
        <UButton @click="isOpen = true" label="Create Assessment" />
      </div>
    </div>

    <div class="space-y-2">
      <div v-if="pending">
        <p>loading...</p>
      </div>
      <div v-else v-for="assessment in assessments" :key="assessment.id">
        <UCard>
          <div class="flex justify-between items-center">
            <p class="lg:text-2xl font-semibold truncate uppercase">
              {{ assessment.title }}
            </p>
            <div class="flex gap-4">
              <UButton
                variant="outline"
                @click="assessmentModal(assessment)"
                icon="ic:outline-remove-red-eye"
                v-if="isEnrolled || role === 'instructor'"
              />
              <UButton
                v-if="role === 'instructor'"
                @click="deleteAssessment(assessment.id)"
                variant="outline"
                icon="carbon:trash-can"
                color="rose"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
    <UModal v-model="isOpen" fullscreen>
      <div class="p-4 space-y-4">
        <div class="flex justify-between gap-4">
          <h3 class="text-2xl font-semibold">Create Assessment</h3>
          <div>
            <UButton @click="isOpen = false" color="rose" label="Close" />
          </div>
        </div>
        <fieldset :disabled="loading">
          <UForm
            :state="assessmentState"
            :schema="schema"
            @submit="createAssessment"
            class="space-y-4"
          >
            <UFormGroup label="Title" name="title">
              <UInput v-model="assessmentState.title" />
            </UFormGroup>

            <div class="flex justify- items-center gap-4">
              <h4 class="text-xl font-semibold">Questions</h4>
              <UButton @click="addQuestion" label="Add Question" />
            </div>

            <div
              v-for="(question, qIndex) in assessmentState.questions"
              :key="qIndex"
              class="space-y-2"
            >
              <div class="flex justify- items-end gap-4">
                <div class="flex-1">
                  <UFormGroup label="Question" name="question">
                    <UInput v-model="question.question" />
                  </UFormGroup>
                </div>
                <UButton
                  @click="removeQuestion(qIndex)"
                  icon="carbon:trash-can"
                  variant="outline"
                  color="rose"
                />
              </div>

              <div class="flex justify- items-center gap-4">
                <h5 class="text-lg font-semibold">Options</h5>
                <UButton @click="addOption(qIndex)" label="Add Option" />
              </div>

              <div
                v-for="(option, oIndex) in question.options"
                :key="oIndex"
                class="flex items-center gap-4"
              >
                <UInput v-model="option.option" placeholder="Option" />
                <UCheckbox v-model="option.isCorrect" label="Correct" />
                <UButton
                  @click="removeOption(qIndex, oIndex)"
                  icon="carbon:trash-can"
                  variant="outline"
                  color="rose"
                />
              </div>
            </div>

            <UButton type="submit" label="Create Assessment" />
          </UForm>
        </fieldset>
      </div>
    </UModal>
    <Loading v-model="loading" />
  </section>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useFirestore, useCurrentUser } from "vuefire";
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import type { Assessment, Question } from "~/types";
import { v4 } from "uuid";
const db = useFirestore();
const user = useCurrentUser();
const props = defineProps<{
  courseId: string;
  role: "student" | "instructor";
  isEnrolled?: boolean;
}>();
const isOpen = ref(false);
const loading = ref(false);
const openAssessmentModal = ref(false);

const notification = useNotification();

const assessment = ref<Assessment | undefined>(undefined);
const assessmentState = ref<{
  title: string;
  questions: Question[];
}>({
  title: "",
  questions: [
    {
      id: v4(),
      question: "",
      options: [{ option: "", isCorrect: false }],
    },
  ],
});

const addQuestion = () => {
  assessmentState.value.questions.push({
    question: "",
    id: v4(),
    options: [{ option: "", isCorrect: false }],
  });
};

const removeQuestion = (qIndex: number) => {
  assessmentState.value.questions.splice(qIndex, 1);
};

const addOption = (qIndex: number) => {
  assessmentState.value.questions[qIndex].options.push({
    option: "",
    isCorrect: false,
  });
};

const removeOption = (qIndex: number, oIndex: number) => {
  assessmentState.value.questions[qIndex].options.splice(oIndex, 1);
};

const createAssessment = async (event: FormSubmitEvent<Schema>) => {

  loading.value = true;
  try {
    if (user.value?.uid && assessmentState.value.title) {
      const assessment = {
        ...event.data,
        instructorId: user.value.uid,
        courseId: props.courseId,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "assessments"), assessment);
      notification({
        title: "Success",
        description: "Assessment created successfully",
        id: "success",
        type: "success",
      });
      isOpen.value = false;
      // Reset state after creating the assessment
      assessmentState.value = {
        title: "",
        questions: [
          {
            question: "",
            options: [{ option: "", isCorrect: false }],
          },
        ],
      };
    }
  } catch (error) {
    notification({
      title: "Error",
      description: "An error occurred while creating the assessment",
      id: "error",
      type: "error",
    });
  } finally {
    loading.value = false;
  }
};

const optionSchema = z.object({
  option: z.string().min(1, { message: "Option must be at least 1 character" }),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  question: z
    .string()
    .min(3, { message: "Question must be at least 3 characters" }),
  options: z
    .array(optionSchema)
    .min(1, { message: "At least one option is required" }),
});

const schema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
});

type Schema = z.output<typeof schema>;

const assessmentQuery = ref<any>(null);
const { data: assessments, pending } =
  useCollection<Assessment>(assessmentQuery);
onMounted(() => {
  assessmentQuery.value = query(
    collection(db, "assessments"),
    where("courseId", "==", props.courseId),
    orderBy("createdAt", "desc")
  );
});

function assessmentModal(a: Assessment) {
  openAssessmentModal.value = true;
  assessment.value = {
    ...a,
    id: a.id,
  };
  props.role == "instructor"
    ? navigateTo(`/instructor/assessments/${a.id}`)
    : navigateTo(`/student/assessments/${a.id}`);
}

async function deleteAssessment(assessmentId: string) {
  try {
    const docRef = doc(db, "assessments", assessmentId);

    // Delete the document
    await deleteDoc(docRef);
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
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
