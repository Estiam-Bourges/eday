export default defineNuxtPlugin(async () => {
  const { getSession, refreshSession } = useAuth()
  
  console.log('Plugin auth - Initialisation...')
  
  // Récupérer la session au chargement
  await getSession()
  
  // Forcer un refresh après un délai pour s'assurer que les données sont à jour
  setTimeout(async () => {
    console.log('Plugin auth - Refresh automatique...')
    await refreshSession()
  }, 1000)
})
