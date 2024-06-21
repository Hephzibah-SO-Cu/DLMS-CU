<script lang="ts" setup>
import type { User } from "~/types";
import { doc, collection } from "firebase/firestore";
const user = useCurrentUser();
const db = useFirestore();
const query = computed(() =>
  user.value ? doc(collection(db, "users"), user.value.uid) : null
);
const { data: userData, pending } = useDocument<User>(query);
const isOpen = ref(false);
const isSmallScreen = useMediaQuery("(max-width: 1024px)");

function closeSidebar(value: boolean) {
  isOpen.value = value;
}
const links = ref([
  {
    label: "Courses",
    path: "/courses",
    // icon: "ic:baseline-storefront",
  },
  // {
  //   label: "Dashboard",
  //   path: `/${userData.role}`,
  //   // icon: "ic:baseline-storefront",
  // },
]);

watch(
  isSmallScreen,
  (value) => {
    if (!value) {
      isOpen.value = false;
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="sticky top-0 backdrop-blur-[9px] py-4 z-50 duration-200">
    <MaxWidthContainer>
      <div class="flex justify-between items-center">
        <div class="flex gap-4 items-center lg:px-0 px-2">
          <div class="lg:hidden">
            <ClientOnly>
              <UButton
                color="white"
                variant="ghost"
                @click="isOpen = true"
                icon="material-symbols-light:lists-rounded"
              />
            </ClientOnly>
          </div>
          <div class="text-3xl uppercase">
            <NuxtLink to="/"> DLMS-CU </NuxtLink>
          </div>
        </div>

        <div class="lg:block hidden">
          <nuxt-link
            active-class="text-primary uppercase"
            class=""
            to="/courses"
            >Courses</nuxt-link
          >
        </div>
        <div class="flex justify-between items-center gap-4 pr-2">
          <div v-if="user && userData" class="flex gap-4 items-center">
            <NuxtLink :to="`/${userData.role}`" class=""> Dashboard </NuxtLink>
            <Profile />
          </div>

          <div v-else class="flex gap-4 items-center">
            <NuxtLink to="/login">Login</NuxtLink>
            <NuxtLink to="/register">Register</NuxtLink>
          </div>

          <ColorMode />
        </div>
      </div>
    </MaxWidthContainer>

    <USlideover v-model="isOpen" side="left">
      <div class="flex justify-between items-center p-4">
        <div class="text-3xl uppercase">
          <NuxtLink to="/" @click="closeSidebar(false)"> DLMS-CU </NuxtLink>
        </div>
        <UButton color="gray" @click="closeSidebar(false)" label="close" />
      </div>
      <UDivider />
      <SidebarMenu :links @close-sidebar="closeSidebar" class="flex-1" />
      <div class="p-4">
        <div class="flex gap-2 justify-between">
          <!-- <Profile /> -->
          <ColorMode />
        </div>
      </div>
    </USlideover>
  </div>
</template>

<style lang="css" scoped></style>
