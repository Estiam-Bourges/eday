import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification et le rôle admin
    const user = await requireAuth(event)
    if (user.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès interdit - Administrateur requis'
      })
    }

    // Statistiques globales
    const [users, ideas, votes] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.vote.count()
    ])

    return { users, ideas, votes }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Erreur lors de la récupération des stats admin:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
