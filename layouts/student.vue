<script lang="ts" setup>
const baseUrl = "/student";
const links = ref([
  // {
  //   label: 'Dashboard',
  //   path: baseUrl,
  //   icon: 'ic:baseline-storefront'
  // },
  {
    label: "Courses",
    path: `${baseUrl}/courses`,
    icon: "carbon:course",
  },
  {
    label: "Enrolled Courses",
    path: `${baseUrl}/courses/enrolled-courses`,
    icon: "carbon:course",
  },
]);
</script>

<template>
  <div class="blocku lg:flex">
    <!-- <Navbar /> -->
    <Sidebar :links />
    <div class="flex-1 lg:h-screen lg:overflow-hidden">
      <div class="lg:overflow-auto h-screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
