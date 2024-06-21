<script lang="ts" setup>
const pricings = [
  {
    title: "Starter",
    description: "For small projects",
    price: "$90",
    features: [
      "Authentication",
      "Payments",
      "Database",
      "Storage",
      "Deployment",
    ],
  },
  {
    title: "Elite",
    description: "You need more power",
    price: "$150",
    features: [
      "Authentication",
      "Payments",
      "Email",
      "Database",
      "Storage",
      "Deployment",
      // "Advanced analytics",
      // "24/7 support",
    ],
  },
];
</script>

<template>
  <div class="py-20 px-[10px] md:space-y-10 space-y-5">
    <h2
      id="pricing"
      class="sm:text-3xl text-2xl font-bold max-w-[600px] text-center mx-auto"
    >
      Save time and money with our affordable pricing plans
    </h2>
    <div class="flex flex-wrap justify-center gap-8">
      <div
        v-for="pricing in pricings"
        class="p-4 shadow-md rounded-md border border-primary flex flex-col justify-between gap-4 max-w-[300px] w-full"
      >
        <div class="space-y-4">
          <div>
            <h3 class="text-2xl font-bold">{{ pricing.title }}</h3>
            <p class="text-sm">{{ pricing.description }}</p>
          </div>
          <p class="text-3xl font-bold text-primary">{{ pricing.price }}</p>
          <div>
            <ul class="">
              <li v-for="feature in pricing.features" :key="feature">
                <span class="before:content-['\2713\0020'] text-primary">
                </span>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <UButton>Buy now</UButton>
          </div>
          <span class="block text-xs font-bold">
            Pay once and use it forever
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
