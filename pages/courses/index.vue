<template>
  <MaxWidthContainer>
    <div class="lg:px-0 px-2 pb-2">
      <Courses />
    </div>
  </MaxWidthContainer>
</template>

<script lang="ts" setup>
useHead({
  title: "Courses",
  meta: [
    {
      name: "description",
      content: "Courses",
    },
  ],
});
definePageMeta({
  // redirect:'/student/courses'
})
</script>

<style></style>
