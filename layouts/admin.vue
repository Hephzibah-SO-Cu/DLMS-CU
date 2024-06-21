<script lang="ts" setup>

const baseUrl = '/admin'
const links = ref([
  {
    label: 'Dashboard',
    path: baseUrl,
    icon: 'ic:baseline-storefront'
  },
  // {
  //   label: 'Admin',
  //   path: `${baseUrl}/admins`,
  //   icon: 'akar-icons:reciept'
  // },
  {
    label: 'Users',
    path: `${baseUrl}/users`,
    icon: 'gridicons:multiple-users'
  },
  // {
  //   label: 'Instructor',
  //   path: `${baseUrl}/instructors`,
  //   icon: 'akar-icons:reciept'
  // },
  // {
  //   label: 'Student',
  //   path: `${baseUrl}/students`,
  //   icon: 'ri:admin-fill',
  // },
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
