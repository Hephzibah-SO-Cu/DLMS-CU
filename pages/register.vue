<template>
  <div class="lg:grid h-[calc(100vh-68px)] block lg:grid-cols-2">
    <div class="hidden lg:block bg-primary">
      <NuxtImg
          class="w-full h-full object-cover rounded-md"
          src="/register.png"
          alt="Login"
        />
    </div>
    <div class="p-4 place-items-center h-full w-full grid mx-auto space-y-4">
      <div class="max-w-[500px] w-full p-4 rounded-lg shadow-md bg-[#34343442]">
        <h1 class="text-2xl font-bold mb-4">Register</h1>
        <fieldset :disabled="loading">
          <UForm
            class="space-y-4"
            :schema="schema"
            :state="state.form"
            @submit="onSubmit"
          >
            <UFormGroup label="First Name" name="firstname">
              <UInput v-model="state.form.firstname" />
            </UFormGroup>
            <UFormGroup label="Last Name" name="lastname">
              <UInput v-model="state.form.lastname" />
            </UFormGroup>
            <UFormGroup label="Email" name="email">
              <UInput v-model="state.form.email" />
            </UFormGroup>
            <UFormGroup label="Password" name="password">
              <UInput v-model="state.form.password" type="password" />
            </UFormGroup>
            <UFormGroup label="Role" name="role">
              <URadioGroup v-model="state.form.role" :options="options" />
            </UFormGroup>

            <UButton :loading type="submit">Submit</UButton>
          </UForm>
        </fieldset>
      </div>
    </div>
  </div>
  <Loading v-model="loading" />
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import {
  createUserWithEmailAndPassword,
  type AuthError,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
const notification = useNotification();
const db = useFirestore();
const auth = useFirebaseAuth();
const loading = ref(false);
const schema = z.object({
  firstname: z.string().min(1, { message: "First name is required" }),
  lastname: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "instructor"], { message: "Invalid role" }),
});

const state = reactive({
  form: {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "",
  },
});

const options = [
  {
    value: "student",
    label: "Student",
  },
  {
    value: "instructor",
    label: "Instructor",
  },
];

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    const { email, password, role, firstname, lastname } = event.data;
    const result = await createUserWithEmailAndPassword(auth!, email, password);
    const idToken = await result.user.getIdToken();

    await $fetch("/api/v1/register", {
      method: "POST",
      body: {
        idToken,
        role,
      },
    });
    const dispalyName = `${firstname} ${lastname}`;
    await updateProfile(result.user, {
      displayName: dispalyName,
    });

    const userRef = doc(db, "users", result.user.uid);
    await setDoc(userRef, {
      uid: result.user.uid,
      email: result.user.email,
      role,
      name: dispalyName,
      createdAt: new Date().toISOString(),
    });

    navigateTo("/");

    notification({
      id: "success",
      description: "User created successfully",
      title: "Success",
    });
  } catch (error: any) {
    console.log(error);
    if (error.code) {
      // This is a Firebase Authentication error
      const authError = error as AuthError;
      notification({
        id: authError.code,
        description: authError.message,
        title: authError.name,
        type: "error",
      });
    } else {
      // This is not a Firebase Authentication error
      // Handle the error as you see fit
      notification({
        id: "error",
        description: error.message,
        title: "Error",
        type: "error",
      });
    }
  } finally {
    loading.value = false;
  }
}

definePageMeta({
  middleware: "alread-logged-in",
});
// This middleware will redirect the user to the home page if they are already logged in
</script>

<style></style>
