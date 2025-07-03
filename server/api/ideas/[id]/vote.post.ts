import { prisma } from '~/server/utils/prisma'
import { getSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { type } = body

    if (!ideaId || !type || !['UP', 'DOWN'].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données invalides'
      })
    }

    const user = await getSession(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentification requise'
      })
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        ideaId_userId: {
          userId: user.id,
          ideaId: ideaId
        }
      }
    })

    let userVote = null

    if (existingVote) {
      if (existingVote.type === type) {
        // Supprimer le vote si c'est le même
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
        userVote = null
      } else {
        // Mettre à jour le vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })
        userVote = type
      }
    } else {
      // Créer un nouveau vote
      await prisma.vote.create({
        data: {
          userId: user.id,
          ideaId: ideaId,
          type
        }
      })
      userVote = type
    }

    // Récupérer les nouveaux totaux
    const votes = await prisma.vote.findMany({
      where: { ideaId }
    })

    return {
      upvotes: votes.filter(v => v.type === 'UP').length,
      downvotes: votes.filter(v => v.type === 'DOWN').length,
      userVote
    }
  } catch (error) {
    console.error('Erreur lors du vote:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})