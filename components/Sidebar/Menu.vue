<template>
  <div class="space-y-4">
    <div class="p-2 grow">
      <ul class="grid gap-4">
        <div class="hidden gap-4 lg:grid">
          <NuxtLink class="font-bold uppercase text-center text-2xl" to="/">
            DLMS-CU
          </NuxtLink>
          <UDivider />
        </div>
        <li v-for="link in links" :key="link.path">
          <nuxt-link
            @click="closeSidebar"
            exact-active-class="dark:text-primary bg-slate-600/40 text-primary-700"
            class="hover:bg-slate-500/40 p-2 rounded-md duration-200 block"
            :to="link.path"
          >
            <div class="flex gap-2 items-center">
              <ClientOnly>
                <u-icon v-if="link.icon" :name="link.icon" class="text-3xl" />
              </ClientOnly>
              {{ link.label }}
            </div>
          </nuxt-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  links: {
    label: string;
    path: string;
    icon?: string;
  }[];
}>();

const emit = defineEmits<{
  closeSidebar: [value: boolean];
}>();

function closeSidebar() {
  emit("closeSidebar", false);
}
</script>

<style></style>
