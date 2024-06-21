<template>
  <Suspense>
    <CourseDetails />
    <template #fallback>
      <div
        class="grid place-items-center h-[calc(100vh-90px)] uppercase text-primary text-xl font-bold"
      >
        <p>getting info <span class="animate-ping">...</span></p>
      </div>
    </template>
  </Suspense>
</template>

<script setup lang="ts"></script>
