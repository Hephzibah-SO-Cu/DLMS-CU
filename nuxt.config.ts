// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig:{
    // adminId: process.env.ADMIN_ID,
    // callback_url: process.env.CALLBACK_URL,
    // telegram_user_bot: process.env.TELEGRAM_BOT_TOKEN,
    // telegram_admin_bot: process.env.TELEGRAM_ADMIN_BOT_TOKEN,
    credential: (() => {
      try {
        return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}");
      } catch (e) {
        console.error("Failed to parse GOOGLE_APPLICATION_CREDENTIALS:", e);
        return {};
      }
    })(),
  },
  modules: [
    "@nuxt/ui",
    "nuxt-vuefire",
    "@nuxt/image",
    "@vueuse/nuxt"
  ],
  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    config: {
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId,
    },
  },
  router: {
    options: {
      // scrollBehaviorType: 'smooth'
    }
  }
})