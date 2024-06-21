<template>
  <div class="p-4 space-y-4">
    <CustomHeader title="Dashboard" />
    <UCard>
      <UTable
        :rows="users"
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
  </div>
</template>

<script lang="ts" setup>
import { query, collection, orderBy, limit } from "firebase/firestore";
import type { User } from "~/types";
const db = useFirestore();
const q = ref<any>(null);
const { data: users, pending, promise } = useCollection<User>(q);
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
onMounted(async () => {
  q.value = query(
    collection(db, "users"),
    orderBy("createdAt", "desc"),
    limit(5)
  );
});

useHead({
  title: "Admin - E Learning",
});
</script>

<style></style>
