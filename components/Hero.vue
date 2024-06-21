<script lang="ts" setup></script>

<template>
  <div class="grid min-h-[calc(100vh-80px)] p-[10px] place-items-center">
    <div class="flex md:flex-row justify-between flex-col gap-2 items-center w-full">
      <div
        class="max-w-[700px] text-center md:text-start md:space-y-10 space-y-5"
      >
        <h1 class="md:text-4xl text-3xl font-bold">
          Learn at Your Pace. Fast Track Your Learning.
        </h1>
        <p class="text-sm">
          Short on time but eager to advance your career? Our eLearning platform offers a wide range of courses that fit into your busy schedule. Learn from top industry experts with easy-to-follow lessons, interactive exercises, and downloadable resources. Whether you're looking to master new skills or earn a certification, we have the courses to help you succeed.
        </p>
        <div>
          <UButton to="/courses"> Browse Courses Now! </UButton>
        </div>
        <div class="flex items-center gap-2 justify-center md:justify-start">
          <div class="flex">
            <UAvatarGroup
              size="sm"
              :ui="{
                margin: '-me-2.5',
                wrapper: 'items-center',
              }"
            >
              <UAvatar
                src="https://avatars.githubusercontent.com/u/739984?v=4"
                alt="benjamincanac"
              />
              <UAvatar
                src="https://avatars.githubusercontent.com/u/904724?v=4"
                alt="Atinux"
              />
              <UAvatar
                src="https://avatars.githubusercontent.com/u/7547335?v=4"
                alt="smarroufin"
              />
              <UAvatar
                src="https://avatars.githubusercontent.com/u/7547335?v=4"
                alt="smarroufin"
              />
              <UAvatar
                src="https://avatars.githubusercontent.com/u/7547335?v=4"
                alt="smarroufin"
              />
            </UAvatarGroup>
          </div>
          <div class="">
            <div>
              <UIcon
                class="text-primary text-sm"
                name="material-symbols-light:star-rounded"
              />
              <UIcon
                class="text-primary text-sm"
                name="material-symbols-light:star-rounded"
              />
              <UIcon
                class="text-primary text-sm"
                name="material-symbols-light:star-rounded"
              />
              <UIcon
                class="text-primary text-sm"
                name="material-symbols-light:star-rounded"
              />
              <UIcon
                class="text-primary text-sm"
                name="material-symbols-light:star-rounded"
              />
            </div>
            <p class="text-xs">300 happy Educators with Students</p>
          </div>
        </div>
      </div>
      <div
        class="max-w-[500px] hidden md:block w-full h-[390px] rounded-md bg-primary shadow-md"
      >
        <NuxtImg
          class="w-full h-full object-cover rounded-md"
          src="/dlms.jpg"
          alt="DLMS CU"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
