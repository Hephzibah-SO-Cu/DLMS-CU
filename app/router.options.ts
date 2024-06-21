import type { RouterConfig } from "@nuxt/schema";

export default <RouterConfig>{
  scrollBehaviorType: "smooth",
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 70,
        behavior: "smooth",
      };
    }
    return {
      top: 0,
      behavior: "smooth",
    };
  },
};
