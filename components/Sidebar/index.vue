<template>
  <div class="relative">
    <div class="flex lg:hidden items-center justify-between w-full h-full p-4">
      <!-- Mobile view -->
      <!-- <p>
        DLMS-CU
      </p> -->
      <ClientOnly>
        <UButton
          color="white"
          @click="isOpen = true"
          variant="ghost"
          icon="material-symbols-light:lists-rounded"
        />
      </ClientOnly>

      <Profile />
    </div>
    <div
      class="hidden lg:flex w-[250px] h-screen lg:flex-col justify-between border-r"
    >
      <!-- Desktop View -->
      <SidebarMenu :links class="flex-1" />

      <div class="p-4">
        <div class="flex gap-2 justify-between">
          <!-- <Profile /> -->

          <ColorMode />
        </div>
      </div>
    </div>

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

<script lang="ts" setup>
const isOpen = ref(false);
const isSmallScreen = useMediaQuery("(max-width: 1024px)");

function closeSidebar(value: boolean) {
  isOpen.value = value;
}

defineProps<{
  links: {
    label: string;
    path: string;
    icon?: string;
  }[];
}>();

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

<style></style>
