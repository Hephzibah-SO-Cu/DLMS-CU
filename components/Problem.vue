<script lang="ts" setup></script>

<template>
  <div class="py-20 px-[10px]">
    <div class="md:space-y-10 space-y-5 text-center">
      <h2
        id="problems"
        class="sm:text-3xl text-2xl font-bold max-w-[600px] mx-auto"
      >
        Don't let fear of technical hurdles prevent you from launching your
        startup
      </h2>

      <p class="">
        Email, User authentication, payments and so on. There's a lot to
        consider when you want to launch your startup.
      </p>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div class="flex flex-col justify-start items-center gap-2">
          <UIcon class="text-5xl" name="arcticons:microsoft-authenticator" />
          <span class="block"> Struggling with authentication setup </span>
        </div>

        <div class="flex flex-col justify-start items-center gap-2">
          <UIcon
            class="text-5xl"
            name="streamline:money-cash-bill-3-accounting-billing-payment-finance-cash-currency-money-bill"
          />
          <span class="block"> Payment integration issues </span>
        </div>

        <div class="flex flex-col justify-start items-center gap-2">
          <UIcon
            class="text-5xl"
            name="material-symbols-light:stacked-email-outline"
          />
          <span class="block"> Email configuration challenges </span>
        </div>

        <div class="flex flex-col justify-start items-center gap-2">
          <UIcon class="text-5xl" name="emojione-monotone:tired-face" />
          <span class="block"> Launch failures and setbacks </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
