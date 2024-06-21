<template>
  <div class="space-y-4" v-if="assessment">
    <Back to="/student/courses"/>
    <CustomHeader :title="`Assessment - ${assessment.title}`">
      <p v-if="hasDone" class="text-3xl">
        {{ total }}
      </p>
    </CustomHeader>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <div
        v-for="(question, qIndex) in state.questions"
        :key="question.id"
        class="space-y-4"
      >
        <UCard>
          <UFormGroup
            :label="`${qIndex + 1}: ${question.question}`"
            :name="`questions[${qIndex}].answer`"
          >
            <URadioGroup
              v-model="question.answer"
              :options="options(question)"
            />
          </UFormGroup>
        </UCard>
      </div>

      <UButton v-if="!hasDone" :loading type="submit"> Submit </UButton>
    </UForm>
  </div>
  <Loading v-model="processing" />
</template>

<script setup lang="ts">
import { z } from "zod";
import type { Question } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

// Define the form schema using Zod
const schema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(
        z.object({
          option: z.string(),
        })
      ),
      answer: z.string().optional(),
    })
  ),
});

type Schema = z.output<typeof schema>;

const route = useRoute();
const user = useCurrentUser();
const notification = useNotification();

if (!user) {
  navigateTo("/login");
}

const loading = ref(false); // Loading state for the form submission

const processing = computed(() => loading.value || pending.value);

const id = route.params.id as string;
// const assessmentRef = doc(db, "assessments", id);
const { data, pending, error, execute,refresh } = await useFetch(
  `/api/v1/assessments/${id}`,
  {
    query: {
      studentId: user.value?.uid,
    },
  }
);

const assessment = computed(() => data.value?.assessment);
const total = computed(() => data.value?.total);
const hasDone = computed(() => data.value?.hasDone);

// Reactive state to hold form data
const state = reactive({
  questions: assessment.value?.questions.map((q) => ({
    ...q,
    answer: undefined,
  })),
});

if (error.value) {
  notification({
    type: "error",
    description: "An error occurred. Please try again.",
    title: "Error",
    id: "error",
  });
  navigateTo("/student/courses");
}

// Get options for URadioGroup
function getOptions(question: Question) {
  return question.options.map((option, index) => ({
    value: String(index),
    label: option.option,
  }));
}

const options = computed(() => getOptions);

// Form submission logic
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    // Validate the form data
    const data = event.data;

    if (assessment.value?.id && user.value?.uid) {
      const result = await $fetch("/api/v1/assessments", {
        method: "POST",
        body: {
          assessmentId: assessment.value.id,
          questions: data.questions,
          studentId: user.value.uid,
          instructorId: assessment.value.instructorId,
          courseId: assessment.value.courseId,
          title: assessment.value.title,
        },
      });

      await refresh();
    }
  } catch (error) {
    console.error(error);
    notification({
      type: "error",
      description: "An error occurred. Please try again.",
      title: "Error",
      id: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped></style>
