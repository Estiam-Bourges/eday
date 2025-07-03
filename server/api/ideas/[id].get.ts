import { prisma } from '~/server/utils/prisma'
import { getSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    
    if (!ideaId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'idée requis'
      })
    }

    // Récupérer l'utilisateur connecté
    const currentUser = await getSession(event)
    
    // Récupérer l'idée avec toutes les relations
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        votes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!idea) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Idée non trouvée'
      })
    }

    // Trouver le vote de l'utilisateur connecté
    const userVote = currentUser 
      ? idea.votes.find(v => v.userId === currentUser.id)?.type || null
      : null

    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      upvotes: idea.votes.filter(v => v.type === 'UP').length,
      downvotes: idea.votes.filter(v => v.type === 'DOWN').length,
      userVote,
      comments: idea.comments,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'idée:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
