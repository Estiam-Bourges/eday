export default defineNuxtPlugin(async () => {
  const { getSession } = useAuth()
  
  // Récupérer la session au chargement
  await getSession()
})
