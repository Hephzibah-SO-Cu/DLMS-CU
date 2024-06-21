export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();

  if (user) {
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
  }
});
