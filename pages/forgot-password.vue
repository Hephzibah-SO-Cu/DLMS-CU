<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { sendPasswordResetEmail } from "firebase/auth";

const auth = useFirebaseAuth();
const notification = useNotification();
const customloading = ref(false);
const origin = window.location.origin;

type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    customloading.value = true;
    await sendPasswordResetEmail(auth!, event.data.email, {
      url: `${origin}/auth?tab=login`,
    });
    notification({
      type: "success",
      description: "Check your email for a password reset link",
      title: "Success",
      id: "success",
    });
    await navigateTo({
      path: "/auth",
      query: { tab: "login" },
    });
  } catch (error: any) {
    notification({
      type: "error",
      description: error.message,
      title: "Error",
      id: "error",
    });
  } finally {
    customloading.value = false;
  }
}

definePageMeta({
  middleware: ["alread-logged-in"],
});
</script>

<template>
  <div class="grid min-h-[calc(100vh-64px)] place-items-center">
    <fieldset :disabled="customloading" class="space-y-4 w-full max-w-[500px]">
      <UCard>
        <template #header>
          <h2 class="text-2xl font-semibold">Forgot Password</h2>
        </template>
        <div class="space-y-4">
          <UForm
            :schema="forgotPasswordSchema"
            :state="forgotPasswordState"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormGroup label="Email" name="email">
              <UInput v-model="forgotPasswordState.email" />
            </UFormGroup>

            <UButton :loading="customloading" type="submit"> Submit </UButton>
          </UForm>

          <UDivider label="OR" />

          <UButton
            to="/auth?tab=login"
            color="black"
            label="Go back to login"
            block
            :disabled="customloading"
          />
        </div>
      </UCard>
    </fieldset>
  </div>
</template>
