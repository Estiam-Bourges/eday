export default defineNuxtRouteMiddleware(async (to) => {
  const { user, getSession } = useAuth()

  if (!user.value) {
    await getSession()
  }

  if (!user.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath }
    })
  }

  // Vérification du rôle admin si demandé par la page
  if (to.meta.requiresAdmin && user.value.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit - Permissions administrateur requises.'
    })
  }
})