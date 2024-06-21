<template>
  <div class="p-4 space-y-4">
    <CustomHeader title="Admin">
      <UButton @click="isOpen = true" label="Add Admin" />
    </CustomHeader>
    <UCard>
      <UTable
        :rows="student"
        :columns
        :loading="pending"
        :ui="{
          td: { base: 'max-w-[200px] truncate' },
        }"
      >
        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>

        <template #name-data="{ row }">
          <span class="capitalize">
            {{ row.name }}
          </span>
        </template>

        <template #role-data="{ row }">
          <span class="capitalize">
            {{ row.role }}
          </span>
        </template>
      </UTable>
    </UCard>

    <AdminModal v-model:isOpen="isOpen" />
  </div>
</template>

<script lang="ts" setup>
import { query, collection, where, orderBy } from "firebase/firestore";
import type { User } from "~/types";
const db = useFirestore();
const isOpen = ref(false);
const q = ref<any>(null);
const { data: student, pending } = useCollection<User>(q);
const columns = [
  {
    key: "name",
    label: "Full name",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "createdAt",
    label: "Created At ",
    sortable: true,
    direction: "desc" as const,
  },

  {
    key: "role",
    label: "Role",
  },
];

// Delay Firebase access until the component is mounted
onMounted(() => {
  q.value = query(
    collection(db, "users"),
    where("role", "==", "admin"),
    orderBy("createdAt", "desc")
  );
});
</script>

<style></style>
