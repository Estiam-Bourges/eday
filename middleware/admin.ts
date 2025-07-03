export default defineNuxtRouteMiddleware((to) => {
  const { user, isAdmin } = useAuth()
  
  console.log('Middleware admin - Route:', to.path)
  console.log('Middleware admin - Utilisateur:', user.value ? { 
    id: user.value.id, 
    role: user.value.role, 
    email: user.value.email 
  } : 'Non connecté')
  console.log('Middleware admin - isAdmin:', isAdmin.value)
  
  if (!user.value) {
    console.log('Redirection vers signin - pas d\'utilisateur')
    return navigateTo('/auth/signin')
  }
  
  if (!isAdmin.value) {
    console.log('Erreur 403 - pas admin, rôle:', user.value.role)
    throw createError({
      statusCode: 403,
      statusMessage: `Accès interdit - Permissions administrateur requises. Rôle actuel: ${user.value.role}`
    })
  }
  
  console.log('Accès autorisé à l\'administration')
})
