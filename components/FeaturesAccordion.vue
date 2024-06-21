<script setup lang="ts">
const items = [
  {
    label: "Authentication",
    icon: "material-symbols:shield-spark-outline-rounded",
    defaultOpen: true,
    content:
      "Authentication is handled by Firebase, providing a secure and reliable user authentication system.",
  },
  {
    label: "Payments",
    icon: "streamline:money-cash-bill-3-accounting-billing-payment-finance-cash-currency-money-bill",
    content:
      "Payments are handled by Paystack, a secure and efficient platform for processing payments.",
  },
  {
    label: "Database",
    icon: "solar:database-outline",
    content:
      "The database is managed by Firebase, offering a scalable and flexible NoSQL cloud database to store and sync data.",
  },
  {
    label: "Emails",
    icon: "material-symbols-light:stacked-email-outline",
    content:
      "Emails are handled by SendGrid, a powerful email service for sending, receiving and tracking email effortlessly.",
  },
  {
    label: "Deployment",
    icon: "mdi:web",
    content:
      "Deployment is managed by Vercel, an optimal solution for frontend projects, providing an easy-to-use platform for automatic deployment, scaling, and performance monitoring.",
  },
  {
    label: "Customization",
    icon: "gridicons:customize",
    content:
      "Customization is made easy with Tailwind CSS, a utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.",
  },
];
</script>

<template>
  <div class="px-[10px] py-20">
    <div class="md:space-y-10 space-y-5">
      <h2
        id="features"
        class="sm:text-3xl text-2xl text-center font-bold max-w-[600px] mx-auto"
      >
        We can help you get your startup off the ground quickly and easily
      </h2>
      <div class="">
        <UAccordion
          color="black"
          variant="ghost"
          size="md"
          :items="items"
          :ui="{
            item: {
              padding: 'px-[12px]',
            },
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
