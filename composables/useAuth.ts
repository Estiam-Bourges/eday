import { createAuthClient } from "better-auth/client"

const authClient = createAuthClient({
  baseURL: process.client ? window.location.origin : process.env.BETTER_AUTH_URL || "http://localhost:3000"
})

export const useAuth = () => {
  const user = useState('auth.user', () => null)
  const loading = useState('auth.loading', () => false)

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const result = await authClient.signIn.email({
        email,
        password
      })
      
      if (result.data?.user) {
        user.value = result.data.user
        return { success: true }
      }
      
      return { 
        success: false, 
        error: result.error?.message || 'Email ou mot de passe incorrect' 
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return { 
        success: false, 
        error: error?.message || 'Erreur de connexion au serveur' 
      }
    } finally {
      loading.value = false
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    loading.value = true
    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password
      })
      
      if (result.data?.user) {
        user.value = result.data.user
        return { success: true }
      }
      
      return { 
        success: false, 
        error: result.error?.message || 'Erreur lors de la création du compte' 
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      return { 
        success: false, 
        error: error?.message || 'Erreur lors de la création du compte'
      }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await authClient.signOut()
      user.value = null
      return { success: true }
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
      return { 
        success: false, 
        error: error?.message || 'Erreur lors de la déconnexion' 
      }
    } finally {
      loading.value = false
    }
  }

  const getSession = async () => {
    try {
      const result = await authClient.getSession()
      
      if (result.data?.user) {
        user.value = result.data.user
      } else {
        user.value = null
      }
      return result.data
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      user.value = null
      return null
    }
  }

  const refreshSession = async () => {
    console.log('Rafraîchissement forcé de la session...')
    await getSession()
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    signUp,
    signOut,
    getSession,
    refreshSession,
    isAuthenticated
  }
}