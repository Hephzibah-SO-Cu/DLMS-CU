<template>
  <div>
    <NuxtLayout name="admin">
      <div class="p-4 lg:space-y-4">
        <Topbar />
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
  title: "Admin - E learning",
});
</script>

<style></style>
