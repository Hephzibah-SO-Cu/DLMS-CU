<template>
  <UModal v-model="isOpen" :prevent-close="loading">
    <div class="p-4 space-y-4" v-if="isCreate">
      <fieldset :disabled="loading">
        <UForm
          :state="createAssignmentState"
          @submit="onSumbit"
          class="space-y-4"
        >
          <UFormGroup label="Title" name="title" required>
            <UInput v-model="createAssignmentState.title" />
          </UFormGroup>
          <UFormGroup label="Description" name="description" required>
            <UTextarea v-model="createAssignmentState.description" />
          </UFormGroup>
          <UButton :loading type="submit" label="submit" />
        </UForm>
      </fieldset>
    </div>
    <div v-else class="p-4 space-y-4">
      <div v-if="assignment" class="space-y-4">
        <CustomHeader :title="assignment.title" />
        <p>
          {{ assignment.description }}
        </p>
      </div>
      <fieldset :disabled="loading">
        <UForm :state="state" @submit="uploadDocument" class="space-y-4">
          <div>
            <UButton
              block
              type="button"
              variant="outline"
              @click="open({ accept: '.doc,.docx,.pdf,.zip', multiple: false })"
            >
              <template v-if="files?.length === 1">
                Selected file: {{ files.item(0)!.name }} (Click to select
                another)
              </template>
              <template v-else> Upload Assignment </template>
            </UButton>
          </div>
          <UButton :loading type="submit" label="submit" />
        </UForm>
      </fieldset>
    </div>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from "zod";
import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
} from "firebase/firestore";
import { v4 } from "uuid";
import type { FormSubmitEvent } from "#ui/types";
import { ref as storageRef } from "firebase/storage";
import type { SubmittedAssignment, Assessment, Assignment } from "~/types";

const user = useCurrentUser();
const db = useFirestore();
const storage = useFirebaseStorage();
const notification = useNotification();
const route = useRoute();
const courseId = route.params.id as string;
const props = defineProps<{
  assignment?: Assignment;
  isCreate?: boolean;
}>();

const { assignment } = toRefs(props);

const state = reactive({
  title: "",
});

const createAssignmentState = ref({
  title: "",
  description: "",
});
const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type Schema = z.output<typeof createAssignmentSchema>;

const { files, open, reset } = useFileDialog();

const isOpen = defineModel({
  default: false,
});
const loading = ref(false);

async function uploadDocument() {
  try {
    if (!files.value) {
      notification({
        title: "Error",
        description: "Please select a file",
        id: "error",
        type: "error",
      });
      return;
    }
    if (
      !assignment.value ||
      !user.value ||
      !user.value.uid ||
      !assignment.value.id
    ) {
      console.log({
        assignment: assignment.value,
        user: user.value,
      });

      notification({
        title: "Error",
        description: "An error occurred",
        id: "error",
        type: "error",
      });
      return;
    }
    loading.value = true;
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
    const url = await uploadFile(file, storageId, "assignments");
    if (!url) {
      throw new Error("An error occurred");
    }
    await submitAssignment(assignment.value.id, user.value.uid, url, storageId);
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

async function submitAssignment(
  assignmentId: string,
  studentId: string,
  url: string,
  storageId: string
) {
  try {
    const assignmentRef = doc(db, "assignments", assignmentId);
    const assignmentData = await getDoc(assignmentRef);

    const submittedAt = new Date().toISOString();

    if (assignmentData.exists()) {
      const assignment = assignmentData.data() as SubmittedAssignment;

      let students = assignment.students || [];

      const studentIndex = students.findIndex(
        (student) => student.studentId === studentId
      );

      if (studentIndex > -1) {
        // Update existing student's submission
        students[studentIndex] = {
          ...students[studentIndex],
          url,
          storageId,
          submittedAt,
        };
      } else {
        // Add new student's submission
        students.push({
          studentId,
          url,
          storageId,
          submittedAt,
        });
      }

      await updateDoc(assignmentRef, {
        studentIds: arrayUnion(studentId),
        students,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // If the assignment document does not exist, create it
      await setDoc(assignmentRef, {
        studentIds: [studentId],
        students: [
          {
            studentId,
            url,
            storageId,
            submittedAt,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
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

async function onSumbit(event: FormSubmitEvent<Schema>) {
  if (props.isCreate) {
    try {
      loading.value = true;
      const data = event.data;
      const assignmentRef = collection(db, "assignments");
      const assignment: Assignment = {
        title: data.title,
        description: data.description,
        courseId: courseId,
        instructorId: user.value?.uid!,
        createdAt: new Date().toISOString(),
      };
      await addDoc(assignmentRef, assignment);
      notification({
        title: "Success",
        description: "Assignment created successfully",
        id: "success",
        type: "success",
      });
      isOpen.value = false;
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
}
watch(isOpen, (value) => {
  if (value) {
    reset();
    state.title = "";
    createAssignmentState.value = {
      title: "",
      description: "",
    };
  }
});
</script>

<style></style>
