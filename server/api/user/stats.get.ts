import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    // Récupérer les statistiques de l'utilisateur
    const [ideasCount, commentsCount, votesCount] = await Promise.all([
      prisma.idea.count({
        where: { authorId: user.id }
      }),
      prisma.comment.count({
        where: { authorId: user.id }
      }),
      prisma.vote.count({
        where: { userId: user.id }
      })
    ])

    return {
      ideasCount,
      commentsCount,
      votesCount
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la récupération des statistiques:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})