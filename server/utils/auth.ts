import { auth } from "~/lib/auth"
import type { H3Event } from "h3"

export async function requireAuth(event: H3Event) {
  const session = await auth.api.getSession({
    headers: getHeaders(event)
  })
  
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié'
    })
  }
  
  return session.user
}

export async function getSession(event: H3Event) {
  try {
    const session = await auth.api.getSession({
      headers: event.node.req.headers
    })
    
    return session?.user || null
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return null
  }
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  
  if (user.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Permissions administrateur requises'
    })
  }
  
  return user
}