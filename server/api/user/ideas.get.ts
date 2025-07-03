import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    // Récupérer les 5 idées les plus récentes de l'utilisateur
    const ideas = await prisma.idea.findMany({
      where: { authorId: user.id },
      include: {
        votes: true,
        comments: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      upvotes: idea.votes.filter(v => v.type === 'UP').length,
      downvotes: idea.votes.filter(v => v.type === 'DOWN').length,
      commentsCount: idea.comments.length,
      createdAt: idea.createdAt
    }))
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la récupération des idées:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})