<template>
  <Suspense>
    <CourseDetailsInstructor />
    <template #fallback>
      loading...
    </template>
  </Suspense>
</template>