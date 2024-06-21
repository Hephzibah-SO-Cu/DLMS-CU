<template>
  <div>
    <UModal v-model="isOpen">
      <div class="p-4 space-y-4">
        <!-- <h2 class="text-lg font-semibold text-center">Profile</h2> -->

        <div class="flex items-center space-y-4 gap-4">
          <div>
            <UAvatar :alt="user?.displayName ?? ''" class="size-20 uppercase text-2xl" />

          </div>
          <div class="flex flex-col space-y-2">
            <span class="text-lg font-semibold capitalize">{{ user?.displayName }}</span>
            <span class="text-sm text-gray-500">{{ user?.email }}</span>
          </div>
        </div>
      </div>

    </UModal>
  </div>
</template>

<script lang="ts" setup>

const isOpen = defineModel('isOpen', {
  default: true
})

const user = useCurrentUser()

</script>

<style></style>