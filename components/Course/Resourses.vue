<template>
  <section class="space-y-4">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <h3 class="capitalize lg:text-3xl font-semibold">Course Resources</h3>
      <div v-if="role === 'instructor'">
        <UButton @click="isOpen = true" label="Add resources" />
      </div>
    </div>

    <div class="space-y-2">
      <div v-if="pending">
        <p>loading...</p>
      </div>
      <div v-else v-for="resource in resources" :key="resource.id">
        <UCard>
          <div class="flex justify-between items-center">
            <p class="lg:text-2xl font-semibold truncate uppercase">
              {{ resource.title }}
            </p>
            <div class="flex gap-4">
              <UButton
                variant="outline"
                icon="carbon:download"
                v-if="isEnrolled || role === 'instructor'"
                @click="downloadResource(resource)"
              />
              <UButton
                v-if="role === 'instructor'"
                variant="outline"
                icon="carbon:trash-can"
                color="rose"
                :loading="deleting"
                @click="deleteResource(resource)"
              />
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>

  <UModal v-model="isOpen" :prevent-close="loading">
    <div class="p-4">
      <fieldset :disabled="loading">
        <UForm
          :schema="schema"
          :state="state"
          @submit="uploadDocument"
          class="space-y-4"
        >
          <UFormGroup label="Title" name="title">
            <UInput v-model="state.title" />
          </UFormGroup>
          <div>
            <UButton
              type="button"
              variant="outline"
              @click="open({ accept: '.doc,.docx,.pdf,.zip', multiple: false })"
            >
              <template v-if="files?.length === 1">
                Selected file: {{ files.item(0)!.name }} (Click to select
                another)
              </template>
              <template v-else> Upload file </template>
            </UButton>
          </div>
          <UButton :loading type="submit" label="submit" />
        </UForm>
      </fieldset>
    </div>
  </UModal>
</template>

<script lang="ts" setup>
import {
  query,
  collection,
  orderBy,
  where,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import type { FormSubmitEvent } from "#ui/types";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { z } from "zod";
import type { Course, CourseResource, User } from "~/types";
import { v4 } from "uuid";

const user = useCurrentUser();
const db = useFirestore();
const storage = useFirebaseStorage();
const notification = useNotification();

const state = reactive({
  title: "",
});

const schema = z.object({
  title: z.string().min(1, "File Name is required"),
});

type Schema = z.output<typeof schema>;

const { files, open, reset } = useFileDialog();

const loading = ref(false);

const props = defineProps<{
  resources: CourseResource[];
  course: Course;
  pending: boolean;
  role: "student" | "instructor";
  isEnrolled?: boolean;
}>();
const isOpen = ref(false);
const deleting = ref(false);

function downloadResource(resource: CourseResource) {
  if (process.client) {
    window.open(resource.url, "_blank");
  }
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

async function uploadDocument(event: FormSubmitEvent<Schema>) {
  try {
    const { title } = event.data;

    if (!files.value) {
      notification({
        title: "Error",
        description: "Please select a file",
        id: "error",
        type: "error",
      });
      return;
    }
    const file = files.value?.item(0);
    if (!file) {
      notification({
        title: "Error",
        description: "Please select a file",
        id: "error",
        type: "error",
      });
      return;
    }
    loading.value = true;
    const storageId = v4();
    const url = await uploadFile(file, storageId, "courses");
    if (!url) {
      throw new Error("An error occurred");
    }
    await uploadFileData(url, title, storageId);
    notification({
      title: "Success",
      description: "File uploaded successfully",
      id: "success",
      type: "success",
    });
    reset();
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

async function uploadFile(file: File, storageId: string, path: string) {
  const data = file;

  const fileRef = storageRef(storage, `${path}/${storageId}`);
  const { url, upload, refresh } = useStorageFile(fileRef);

  try {
    if (data) {
      await upload(data);
      await refresh();
      return url.value;
    }
  } catch (error) {
    console.log(error);
  }
}

async function uploadFileData(url: string, title: string, storageId: string) {
  try {
    const data: CourseResource = {
      title: title.toLowerCase(),
      storageId,
      url,
      createdAt: new Date().toISOString(),
      instructorId: props.course.instructorId,
      courseId: props.course.id!,
    };
    await addDoc(collection(db, "courseresources"), data);
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

watch(isOpen, (value) => {
  if (value) {
    reset();
    state.title = "";
  }
});
</script>

<style></style>
