export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isAdmin } = useAuth()
  
  if (!user.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath }
    })
  }
  
  if (!isAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès refusé - Permissions administrateur requises'
    })
  }
})
