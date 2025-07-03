import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    const ideaId = getRouterParam(event, 'id')
    const { type } = await readBody(event)

    if (!ideaId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'idée requis'
      })
    }

    if (!type || !['UP', 'DOWN'].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type de vote invalide'
      })
    }

    // Vérifier si l'idée existe
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId }
    })

    if (!idea) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Idée non trouvée'
      })
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        ideaId_userId: {
          ideaId: ideaId,
          userId: user.id
        }
      }
    })

    if (existingVote) {
      // Mettre à jour le vote existant
      await prisma.vote.update({
        where: {
          ideaId_userId: {
            ideaId: ideaId,
            userId: user.id
          }
        },
        data: {
          type: type
        }
      })
    } else {
      // Créer un nouveau vote
      await prisma.vote.create({
        data: {
          type: type,
          ideaId: ideaId,
          userId: user.id
        }
      })
    }

    // Récupérer les votes mis à jour
    const votes = await prisma.vote.findMany({
      where: { ideaId: ideaId }
    })

    return {
      upvotes: votes.filter(v => v.type === 'UP').length,
      downvotes: votes.filter(v => v.type === 'DOWN').length
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors du vote:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})