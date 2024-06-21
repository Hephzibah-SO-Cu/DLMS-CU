// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser();
  const notification = useNotification();
  // Redirect the user to the login page if not authenticated
  if (!user) {
    if (to.path !== '/login') {
      return navigateTo({
        path: '/login',
        query: {
          redirect: to.fullPath,
        },
      });
    }
    return;
  }

  const idTokenResult = await user.getIdTokenResult();
  const role = idTokenResult.claims.role;

  const isAdminRoute = to.path.startsWith('/admin');
  const isStudentRoute = to.path.startsWith('/student');
  const isInstructorRoute = to.path.startsWith('/instructor');


  if (role === 'admin' && !isAdminRoute) {
    notification({
      title: 'Unauthorized',
      description: 'You are not authorized to access this page',
      type: 'error',
      id: 'unauthorized',
    })
    return navigateTo('/admin');
  }
  if (role === 'student' && !isStudentRoute) {
    notification({
      title: 'Unauthorized',
      description: 'You are not authorized to access this page',
      type: 'error',
      id: 'unauthorized',
    })
    return navigateTo('/student');
  }
  if (role === 'instructor' && !isInstructorRoute) {
    notification({
      title: 'Unauthorized',
      description: 'You are not authorized to access this page',
      type: 'error',
      id: 'unauthorized',
    })
    return navigateTo('/instructor');
  }
  if (!role && to.path !== '/') {
    notification({
      title: 'Unauthorized',
      description: 'You are not authorized to access this page',
      type: 'error',
      id: 'unauthorized',
    })
    return navigateTo('/');
  }
});
