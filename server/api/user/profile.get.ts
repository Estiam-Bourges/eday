import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    // Récupérer les données utilisateur avec statistiques
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        ideas: {
          include: {
            votes: true,
            comments: {
              select: { id: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          select: { id: true }
        },
        votes: {
          select: { id: true }
        }
      }
    })

    if (!userData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    // Calculer les statistiques
    const ideasCount = userData.ideas.length
    const commentsCount = userData.comments.length
    const votesCount = userData.votes.length
    
    let totalUpvotes = 0
    let totalDownvotes = 0
    
    for (const idea of userData.ideas) {
      const upvotes = idea.votes.filter(vote => vote.type === 'UP').length
      const downvotes = idea.votes.filter(vote => vote.type === 'DOWN').length
      totalUpvotes += upvotes
      totalDownvotes += downvotes
    }

    const stats = {
      ideasCount,
      commentsCount,
      votesCount,
      totalUpvotes,
      totalDownvotes
    }

    // Formater les idées récentes
    const recentIdeas = userData.ideas.slice(0, 5).map(idea => {
      const upvotes = idea.votes.filter(v => v.type === 'UP').length
      const downvotes = idea.votes.filter(v => v.type === 'DOWN').length
      const commentsCount = idea.comments.length
      
      return {
        id: idea.id,
        title: idea.title,
        description: idea.description,
        upvotes,
        downvotes,
        commentsCount,
        createdAt: idea.createdAt
      }
    })

    return {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        role: userData.role
      },
      stats,
      recentIdeas
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la récupération du profil:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})