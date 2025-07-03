export default defineNuxtRouteMiddleware(async (to) => {
  const { user, getSession } = useAuth()
  
  // Vérifier la session si pas d'utilisateur
  if (!user.value) {
    await getSession()
  }
  
  if (!user.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath }
    })
  }
})
