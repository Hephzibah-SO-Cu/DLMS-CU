<template>
  <div>
    <UModal
      v-model="isOpen"
      class="!max-w-[800px] !w-full"
      :prevent-close="loading"
    >
      <fieldset :disabled="loading" class="space-y-4 p-4">
        <h2>Add User</h2>

        <UForm
          class="space-y-4"
          :schema="userSchema"
          :state="user"
          @submit="onSubmit"
        >
          <UFormGroup name="firstName" label="First Name">
            <UInput v-model="user.firstName" />
          </UFormGroup>

          <UFormGroup label="Last Name" name="lastName">
            <UInput v-model="user.lastName" />
          </UFormGroup>

          <UFormGroup label="Email" name="email">
            <UInput v-model="user.email" />
          </UFormGroup>

          <UFormGroup label="Role" name="role">
            <URadioGroup v-model="user.role" :options="options" />
          </UFormGroup>

          <UButton type="submit" :loading> Submit </UButton>
        </UForm>
      </fieldset>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

const isOpen = defineModel<boolean>("isOpen", {
  default: false,
});

const notification = useNotification();

const loading = ref(false);
const user = ref({
  firstName: "",
  lastName: "",
  email: "",
  role: "",
});

const options = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "instructor",
    label: "Instructor",
  },
  {
    value: "student",
    label: "Student",
  },
];
type UserSchema = z.output<typeof userSchema>;

async function onSubmit(event: FormSubmitEvent<UserSchema>) {
  try {
    loading.value = true;
    const data = await $fetch("/api/v1/users", {
      method: "POST",
      body: {
        ...event.data,
      },
    });
    user.value = {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    };
    isOpen.value = false;
    notification({
      id: "success",
      title: "Success",
      description: data.message,
    });
  } catch (error: any) {
    notification({
      id: "error",
      title: "Error",
      description: error.data.message,
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}

watch(isOpen, (value) => {
  if (!value) {
    user.value = {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
    };
  }
});
</script>

<style></style>
