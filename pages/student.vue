<template>
  <div>
    <NuxtLayout name="student">
      <div class="p-4 space-y-4">
        <Topbar class="hidden lg:block" />
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
  middleware: "auth",
});

useHead({
  title: "Student - E learning",
});
</script>

<style></style>
