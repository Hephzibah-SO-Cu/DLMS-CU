<template>
  <div class="grid place-items-center h-full">
    <div class="rounded-md shadow-lg  max-w-[500px] w-full p-4 space-y-4">
      <div class="space-y-2">
        <h2 class="text-3xl">
          Welcome back
        </h2>
        <p>

        </p>
      </div>
      <fieldset :disabled="loading">
        <UForm class="space-y-4 p-4" :state :schema @submit="onSubmit">

          <UFormGroup label="Email" name="email">
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup name="password" label="Password">
            <UInput v-model="state.password" type="password" />
          </UFormGroup>

          <UButton type="submit" :loading>
            Submit
          </UButton>
        </UForm>
      </fieldset>
    </div>
  </div>
  <UModal v-model="loading" :prevent-close="loading"/>
</template>

<script lang="ts" setup>
import { z } from 'zod';
import type { FormSubmitEvent } from '#ui/types'
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc,getDoc } from 'firebase/firestore'
import type { User } from '~/types';


const auth = useFirebaseAuth()
const db = useFirestore()
const notification = useNotification()
const loading = ref(false)
const state = ref({
  email: undefined,
  password: undefined
})

const schema = z.object({
  email: z.string().email(),
  password: z.string()
})

type Schema = z.output<typeof schema>
const { redirect } = useRoute().query;

async function onSubmit(event: FormSubmitEvent<Schema>) {

  try {
    loading.value = true
    const data = await signInWithEmailAndPassword(
      auth!,
      event.data.email,
      event.data.password
    );
    notification({
      id: 'success',
      title: 'Success',
      description: 'User logged in successfully',
    })
    if (redirect) {
      await navigateTo(redirect as string);
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', data.user.uid))
    if (!userDoc.exists()) {
      return navigateTo('/')
    }
    const user = userDoc.data() as User
    navigateTo(`/${user.role}`)
  } catch (error: any) {
    notification({
      id: 'error_id',
      title: 'Error',
      description: error.message,
      type: 'error'
    })

  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: "alread-logged-in",
});

useHead({
  title:'Login - E-learning'
})
</script>

<style></style>