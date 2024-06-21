<template>
  <div>
    <UButton
      @click="back"
      label="Back"
      variant="outline"
      icon="material-symbols:arrow-back-ios-rounded"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  to?: string;
}>();
const router = useRouter();
function back() {
  history.length > 1 ? router.back() : navigateTo(props.to || "/");
}
</script>

<style></style>
