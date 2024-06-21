<template>
  <div>
    <UModal
      v-model="isOpen"
      class="!max-w-[800px] !w-full"
      :prevent-close="loading"
    >
      <fieldset :disabled="loading" class="space-y-4 p-4">
        <h2 class="text-2xl font-medium">{{ modalTitle }}</h2>

        <UForm
          class="space-y-4"
          :schema="courseSchema"
          :state="course"
          @submit="onSubmit"
        >
          <UFormGroup name="title" label="Title">
            <UInput v-model="course.title" />
          </UFormGroup>
          <UFormGroup label="Description" name="description">
            <UTextarea
              autoresize
              v-model="course.description"
              :maxrows="10"
              :placeholder="'A brief detail of the course'"
            />
          </UFormGroup>

          <UFormGroup
            name="keywords"
            label="Keywords"
            help="Keywords are tags for your course, so make sure each keyword is separated with a comma"
          >
            <UInput v-model="course.keywords" />
          </UFormGroup>
          <UButton type="submit" :loading="loading">
            {{ modalButton }}
          </UButton>
        </UForm>
      </fieldset>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import type { Course } from "~/types";

const isOpen = defineModel<boolean>("isOpen", {
  default: false,
});

const props = defineProps<{ course?: Course }>();
const editCourse = toRef(props, "course");

const user = useCurrentUser();
const notification = useNotification();
const db = useFirestore();

const loading = ref(false);

const course = ref({
  title: "",
  description: "",
  keywords: "",
});

const isEditing = computed(() => !!editCourse.value);
const modalTitle = computed(() =>
  isEditing.value ? "Edit Course" : "Add Course"
);
const modalButton = computed(() => (isEditing.value ? "Update" : "Add"));
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z
    .string({
      message: "At least a keyword is required",
    })
    .min(1, "At least a keyword is required"),
});

type CourseSchema = z.output<typeof courseSchema>;

async function onSubmit(event: FormSubmitEvent<CourseSchema>) {
  if (editCourse.value) {
    const data = {
      ...event.data,
    };
    await updateCourse(
      editCourse.value.id!,
      data.title.toLowerCase(),
      data.description,
      data.keywords.toLowerCase()
    );
  } else {
    if (!user.value?.uid) {
      return navigateTo("/login");
    }
    const data = {
      description: event.data.description,
      title: event.data.title.toLowerCase(),
      createdAt: new Date().toISOString(),
      instructorId: user.value.uid,
      keywords: event.data.keywords.toLowerCase(),
    };
    await createCourse(data);
  }
}

watchEffect(() => {
  if (editCourse.value) {
    course.value = { ...editCourse.value };
  }
  if (!isOpen.value) {
    course.value = {
      description: "",
      title: "",
      keywords: "",
    };
  }
});

async function updateCourse(
  courseId: string,
  newTitle: string,
  newDescription: string,
  newKeywords: string
) {
  try {
    const docRef = doc(db, "courses", courseId);
    loading.value = true;
    await updateDoc(docRef, {
      title: newTitle,
      description: newDescription,
      updateAt: new Date().toISOString(),
      keywords: newKeywords,
    });
    course.value = {
      description: "",
      title: "",
      keywords: "",
    };
    notification({
      title: "Success",
      description: "Course updated successfully",
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

async function createCourse(data: Course) {
  try {
    loading.value = true;
    await addDoc(collection(db, "courses"), data);
    course.value = {
      description: "",
      title: "",
      keywords: "",
    };
    notification({
      id: "success",
      title: "Success",
      description: "Course added successfully",
    });
  } catch (error: any) {
    notification({
      id: error,
      title: "Error",
      description: error.data.message,
      type: "error",
    });
  } finally {
    loading.value = false;
    isOpen.value = false;
  }
}
</script>

<style></style>
