<template>
  <div class="">
    <UDropdown
      :items="items"
      :ui="{
        item: { disabled: 'cursor-text select-text' },
        width: 'max-w-[300px] w-full',
      }"
      :popper="{ placement: 'bottom-start' }"
    >
      <UAvatar :alt="avatar.alt" size="md" class="uppercase" />

      <template #account="{ item }">
        <div class="text-left">
          <p>Signed in as</p>
          <p class="truncate font-medium text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
        </div>
      </template>

      <template #item="{ item }">
        <span class="truncate">{{ item.label }}</span>

        <UIcon
          :name="item.icon"
          class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
        />
      </template>
    </UDropdown>

    <ProfileModal v-model:isOpen="isOpen" />
  </div>
</template>

<script lang="ts" setup>
import { signOut } from "firebase/auth";
const auth = useFirebaseAuth();
const notification = useNotification();
const user = useCurrentUser();

const isOpen = ref(false);
const avatar = ref({
  alt: user.value?.displayName ?? "Guest",
});

const items = [
  [
    {
      label: user.value?.email ?? "Guest@email.com",
      slot: "account",
      disabled: true,
    },
  ],

  [
    {
      label: "Profile",
      icon: "material-symbols:account-circle",
      click: () => {
        isOpen.value = true;
      },
    },
  ],
  [
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-left-on-rectangle",
      click: () => {
        logout();
      },
    },
  ],
];

function logout() {
  signOut(auth!)
    .then(() => {
      // Sign-out successful.
      notification({
        id: "sign-out",
        title: "Sign out",
        description: "You have been signed out successfully",
      });
      navigateTo({
        path: "/login",
  
      });
    })
    .catch((error) => {
      // An error happened.
      notification({
        id: "sign-out",
        title: "Sign out",
        description: "An error occurred while signing out",
        type: "error",
      });
    });
}
</script>

<style></style>
