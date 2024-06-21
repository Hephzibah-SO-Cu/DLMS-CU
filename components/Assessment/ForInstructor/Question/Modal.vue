<template>
  <UModal v-model:model-value="isOpen" :prevent-close="loading">
    <div v-if="!isDelete" class="p-2">
      <div class="space-y-4">
        <fieldset :disabled="loading" class="space-y-4 p-4">
          <h2 class="text-2xl font-medium">{{ modalTitle }}</h2>

          <UForm
            class="space-y-4"
            :schema="questionSchema"
            :state="questionState"
            @submit="onSubmit"
          >
            <UFormGroup name="question" label="Question">
              <UInput v-model="questionState.question" />
            </UFormGroup>

            <section class="space-y-4">
              <div class="flex justify- items-center gap-4">
                <h5 class="text-lg font-semibold">Options</h5>
                <UButton @click="addOption()" label="Add Option" />
              </div>

              <UFormGroup name="options">
                <div class="space-y-2">
                  <div
                    v-for="(o, oIndex) in optionsState"
                    :key="oIndex"
                    class="flex items-center gap-4"
                  >
                    <div class="flex items-center gap-4">
                      <UInput v-model="o.option" placeholder="Option" />
                      <UCheckbox v-model="o.isCorrect" label="Correct" />
                      <UButton
                        icon="carbon:trash-can"
                        variant="outline"
                        color="rose"
                        @click="removeOption(oIndex)"
                      />
                    </div>
                  </div>
                </div>
              </UFormGroup>
            </section>

            <UButton type="submit" :loading="loading">
              {{ modalButton }}
            </UButton>
          </UForm>
        </fieldset>
      </div>
    </div>
    <div v-else>
      <UCard>
        <p class="">
          Are you sure you want to delete this question, You can't undo this
          process.
        </p>
        <template #footer>
          <fieldset :disabled="loading">
            <div class="flex flex-wrap justify-end gap-4">
              <UButton
                v-if="question"
                :loading
                @click="deleteQuestionFromAssessment(assessmentId, question)"
                color="rose"
              >
                Yes
              </UButton>
              <UButton @click="isOpen = false" color="gray" variant="outline">
                No
              </UButton>
            </div>
          </fieldset>
        </template>
      </UCard>
    </div>
  </UModal>
</template>

<script lang="ts" setup>
import type { Question } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { z } from "zod";
import { v4 } from "uuid";

const notification = useNotification();
const db = useFirestore();
const isOpen = defineModel({
  default: false,
});

const route = useRoute();
const assessmentId = route.params.id as string;

const props = defineProps<{ question?: Question; isDelete?: boolean }>();
const editQuestion = toRef(props, "question");
const isEditing = computed(() => !!props.question);
const modalTitle = computed(() =>
  isEditing.value ? "Edit Question" : "Add Question"
);
const loading = ref(false);
const modalButton = computed(() => (isEditing.value ? "Update" : "Add"));

const optionSchema = z.object({
  option: z.string().min(1, "Option is required"),
  isCorrect: z.oboolean(),
});

const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(optionSchema, {
      message: "An option is needed",
    })
    .min(2, "At least 2 options are needed"),
});

const optionsState = ref<
  {
    option: string;
    isCorrect?: boolean;
  }[]
>([{ option: "", isCorrect: false }]);

const questionState = ref<Question>({
  question: "",
  options: optionsState.value,
});

const addOption = () => {
  optionsState.value.push({
    option: "",
    isCorrect: false,
  });


  questionState.value.options = [...optionsState.value];
};

const removeOption = (oIndex: number) => {
  optionsState.value.splice(oIndex, 1);
};
type QuestionSchema = z.output<typeof questionSchema>;

async function onSubmit(event: FormSubmitEvent<QuestionSchema>) {
  if (editQuestion.value) {
    const data = { ...event.data } as Question;
    await updateQuestionInAssessment(assessmentId, data);
  } else {
    const data = { id: v4(), ...event.data } as Question;

    await addQuestionToAssessment(assessmentId, data);
  }
}

watchEffect(() => {
  if (editQuestion.value) {
    questionState.value = { ...editQuestion.value };
    optionsState.value = [...editQuestion.value.options];
  }
  if (!isOpen.value) {
    questionState.value = {
      options: [],
      question: "",
    };
    optionsState.value = [{ option: "", isCorrect: false }];
  }
});

async function updateQuestionInAssessment(
  assessmentId: string,
  updatedQuestion: Question
) {
  try {
    const docRef = doc(db, "assessments", assessmentId);
    loading.value = true;

    // Fetch the current assessment document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Get the current questions array
      const questions = docSnap.data().questions as Question[];

      // Find the index of the question to update
      const index = questions.findIndex(
        (question) => question.id === updatedQuestion.id
      );

      // Replace the old question with the updated question
      questions[index] = updatedQuestion;

      // Write the updated questions array back to the assessment document
      await updateDoc(docRef, {
        questions: questions,
        updateAt: new Date().toISOString(),
      });

      notification({
        title: "Success",
        description: "Question updated successfully",
        id: "success",
        type: "success",
      });
    } else {
      console.log("No such document!");
    }
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
    isOpen.value = false;
  }
}

async function deleteQuestionFromAssessment(
  assessmentId: string,
  questionToDelete: Question
) {
  try {
    const docRef = doc(db, "assessments", assessmentId);
    loading.value = true;

    // Remove the question
    await updateDoc(docRef, {
      questions: arrayRemove(questionToDelete),
      updateAt: new Date().toISOString(),
    });

    notification({
      title: "Success",
      description: "Question deleted successfully",
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
    isOpen.value = false;
  }
}

async function addQuestionToAssessment(
  assessmentId: string,
  newQuestion: Question
) {
  try {
    const docRef = doc(db, "assessments", assessmentId);
    loading.value = true;

    // Add the new question
    await updateDoc(docRef, {
      questions: arrayUnion(newQuestion),
      updateAt: new Date().toISOString(),
    });

    notification({
      title: "Success",
      description: "Question added successfully",
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
    isOpen.value = false;
  }
}
</script>

<style></style>
