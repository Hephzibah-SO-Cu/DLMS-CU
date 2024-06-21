// middleware/auth.ts

import { defineNuxtRouteMiddleware } from 'nuxt/app';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();

  // Redirect the user to the login page if not authenticated
  if (!user) {
    return navigateTo({
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    });
  }

  const idTokenResult = await user.getIdTokenResult();
  switch (idTokenResult.claims.role) {
    case 'admin':
      return await navigateTo({
        path: "/admin",
      });
    case 'student':
      return await navigateTo({
        path: "/student",
      });
    case 'instructor':
      return await navigateTo({
        path: "/instructor",
      });
    default:
      return await navigateTo({
        path: "/",
      });
  }

});
