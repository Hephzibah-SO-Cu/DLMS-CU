<script lang="ts" setup>
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  startAfter,
  getDocs,
} from "firebase/firestore";
import type { User } from "~/types";

const db = useFirestore();
const notification = useNotification();
const search = ref("");
const page = ref(1);
const pageCount = ref<string | number>(10);
const pageTotal = ref(0);
const users = ref<User[]>([]);
const lastVisible = ref<any>(null);
const loading = ref(false);
const isOpen = ref(false);
const isGettingUser = ref(false);

// Function to fetch the total count of users
async function fetchTotalCount() {
  const snapshot = await getDocs(collection(db, "users"));
  pageTotal.value = snapshot.size;
}

// Function to set up a real-time listener
// function setupListener() {
//   isGettingUser.value = true;
//   let q;

//   if (lastVisible.value && page.value > 1) {
//     q = query(
//       collection(db, "users"),
//       orderBy("createdAt", "desc"),
//       startAfter(lastVisible.value),
//       limit(+pageCount.value)
//     );
//   } else {
//     q = query(
//       collection(db, "users"),
//       orderBy("createdAt", "desc"),
//       limit(+pageCount.value)
//     );
//   }

//   onSnapshot(
//     q,
//     (snapshot) => {
//       users.value = snapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() } as User)
//       );
//       lastVisible.value = snapshot.docs[snapshot.docs.length - 1];
//       isGettingUser.value = false;
//     },
//     (error) => {
//       console.error("Error fetching users:", error);
//       isGettingUser.value = false;
//     }
//   );
// }

// Function to fetch users with pagination and search
async function fetchUsers() {
  isGettingUser.value = true;
  let q;

  if (lastVisible.value && page.value > 1) {
    q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible.value),
      limit(+pageCount.value)
    );
  } else {
    q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(+pageCount.value)
    );
  }

  try {
    const snapshot = await getDocs(q);
    users.value = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as User)
    );
    lastVisible.value = snapshot.docs[snapshot.docs.length - 1];
  } catch (err) {
    console.error("Error fetching users:", err);
  } finally {
    isGettingUser.value = false;
  }
}
async function removeUser(user: User) {
  try {
    loading.value = true;
    if (!user.id) {
      return;
    }

    const result = await $fetch("/api/v1/users", {
      method: "DELETE",
      body: {
        uid: user.id,
      },
    });

    fetchTotalCount();
    fetchUsers()

    notification({
      id: user.id,
      title: "User deleted",
      description: `User ${user.name} has been deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting user:", err);

    notification({
      id: user.id,
      title: "User deleted error",
      description: `User ${user.name} failed to delete`,
      type: "error",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchTotalCount();
  fetchUsers();
  // setupListener();
});

function refresh() {
  // setupListener();
  fetchTotalCount();
}

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
    label: "Created At",
    sortable: true,
    direction: "desc" as const,
  },
  {
    key: "role",
    label: "Role",
    sortable: true,
    direction: "desc" as const,
  },
  { key: "actions", label: "Actions", sortable: false },
];

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

function resetFilters() {
  search.value = "";
}

const pageFrom = computed(() => (page.value - 1) * +pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * +pageCount.value, pageTotal.value)
);

const filteredRows = computed(() => {
  if (!search.value) {
    return users.value;
  }
  return users.value.filter((user) =>
    user.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

watch([page, pageCount, search], () => {
  // setupListener();
  fetchTotalCount();
  fetchUsers();
});
</script>

<template>
  <Loading v-model="loading" />
  <UserModal v-model:isOpen="isOpen" />
  <ClientOnly>
    <UCard
      class="w-full"
      :ui="{
        base: '',
        ring: '',
        divide: 'divide-y divide-gray-200 dark:divide-gray-700',
        header: { padding: 'px-4 py-5' },
        body: {
          padding: '',
          base: 'divide-y divide-gray-200 dark:divide-gray-700',
        },
        footer: { padding: 'p-4' },
      }"
    >
      <template #header>
        <div class="flex justify-between gap-4">
          <h2
            class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
          >
            Users
          </h2>
          <div class="flex gap-2 items-center">
            <!-- <UButton @click="refresh" label="Refresh User" /> -->
            <UButton @click="isOpen = true" label="Create User" />
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Search by name..."
        />
      </div>

      <!-- Header and Action buttons -->
      <div class="flex justify-between items-center w-full px-4 py-3">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5">Rows per page:</span>
          <USelect
            v-model="pageCount"
            :options="[5, 10, 20, 30, 50, 200]"
            class="me-2 w-20"
            size="xs"
          />
        </div>
        <div class="flex gap-1.5 items-center">
          <USelectMenu v-model="selectedColumns" :options="columns" multiple>
            <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
              Columns
            </UButton>
          </USelectMenu>
          <UButton
            icon="i-heroicons-funnel"
            color="gray"
            size="xs"
            :disabled="search === ''"
            @click="resetFilters"
          >
            Reset
          </UButton>
        </div>
      </div>

      <!-- Table -->
      <UTable
        :rows="filteredRows"
        :columns="columnsTable"
        :loading="isGettingUser"
        class="w-full"
        :ui="{
          td: { base: 'max-w-[200px] truncate' },
        }"
      >
        <template #createdAt-data="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
        <template #name-data="{ row }">
          <p class="capitalize">
            {{ row.name }}
          </p>
        </template>
        <template #role-data="{ row }">
          <span class="capitalize">
            {{ row.role }}
          </span>
        </template>
        <template #actions-data="{ row }">
          <div class="flex gap-4">
            <!-- <UButton
              icon="i-heroicons-pencil"
              size="2xs"
              color="blue"
              variant="outline"
              :ui="{ rounded: 'rounded-full' }"
              square
            /> -->
            <UButton
              icon="i-heroicons-trash"
              size="2xs"
              color="red"
              variant="outline"
              :ui="{ rounded: 'rounded-full' }"
              square
              @click="removeUser(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- Number of rows & Pagination -->
      <template #footer>
        <div class="flex flex-wrap justify-between items-center">
          <div>
            <span class="text-sm leading-5">
              Showing
              <span class="font-medium">{{ pageFrom }}</span>
              to
              <span class="font-medium">{{ pageTo }}</span>
              of
              <span class="font-medium">{{ pageTotal }}</span>
              results
            </span>
          </div>
          <UPagination
            v-model="page"
            :page-count="+pageCount"
            :total="pageTotal"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
          />
        </div>
      </template>
    </UCard>
    <template #fallback>
      <div
        class="grid place-items-center h-[calc(100vh-90px)] uppercase text-primary text-xl font-bold"
      >
        <p>getting info <span class="animate-ping">...</span></p>
      </div>
    </template>
  </ClientOnly>
</template>
