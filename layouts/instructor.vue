<script lang="ts" setup>

const baseUrl = '/instructor'
const links = ref([
  // {
  //   label: 'Dashboard',
  //   path: baseUrl,
  //   icon: 'hugeicons:dashboard-square-02'
  // },
  {
    label: 'Courses',
    path: `${baseUrl}/courses`,
    icon: 'carbon:course'
  },
  {
    label:'Enrolled Courses',
    path: `${baseUrl}/courses/enrolled-courses`,
    icon: 'carbon:user-role'
  },
  // {
  //   label: "Enrolled Students",
  //   path: `${baseUrl}/enrolled-students`,
  //   icon: 'carbon:user-role'
  // }
])

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
