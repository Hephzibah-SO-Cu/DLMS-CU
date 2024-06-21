<template>
  <div>
    <NuxtLayout name="instructor" key="instructor">
      <div class="p-2 space-y-2">
        <Topbar />
        <UDivider />
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: "auth",
  layout: false,
});

useHead({
  title: "Instructor - E learning",
});
</script>

<style></style>
