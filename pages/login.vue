<template>
  <div class="lg:grid h-[calc(100vh-68px)] block lg:grid-cols-2">
    <div class="hidden lg:block bg-primary">
      <NuxtImg
          class="w-full h-full object-cover rounded-md"
          src="/login.png"
          alt="Login"
        />
    </div>
    <div class="p-4 place-items-center h-full w-full grid mx-auto space-y-4">
      <div class="max-w-[500px] w-full p-4 rounded-lg shadow-md bg-[#34343442]">
        <h1 class="text-2xl font-bold mb-4">Welcome back</h1>
        <fieldset :disabled="loading">
          <UForm class="space-y-4 p-4" :state :schema @submit="onSubmit">
            <UFormGroup label="Email" name="email">
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup name="password" label="Password">
              <UInput v-model="state.password" type="password" />
            </UFormGroup>

            <UButton type="submit" :loading> Submit </UButton>
          </UForm>
        </fieldset>
      </div>
    </div>
  </div>

  <Loading v-model="loading"> </Loading>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "~/types";

const auth = useFirebaseAuth();
const db = useFirestore();
const notification = useNotification();
const loading = ref(false);
const state = ref({
  email: undefined,
  password: undefined,
});

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type Schema = z.output<typeof schema>;
const { redirect } = useRoute().query;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    const data = await signInWithEmailAndPassword(
      auth!,
      event.data.email,
      event.data.password
    );
    notification({
      id: "success",
      title: "Success",
      description: "User logged in successfully",
    });
    if (redirect) {
      await navigateTo(redirect as string);
      return;
    }
    const userDoc = await getDoc(doc(db, "users", data.user.uid));
    if (!userDoc.exists()) {
      return navigateTo("/");
    }
    const user = userDoc.data() as User;
    navigateTo(`/${user.role}`);
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

useHead({
  title: "Login - E-learning",
});
</script>

<style></style>
