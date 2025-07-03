import { prisma } from '~/server/utils/prisma'
import { getSession } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const sort = query.sort as string || 'recent'
    
    const skip = (page - 1) * limit
    
    // Récupérer l'utilisateur connecté
    const currentUser = await getSession(event)
    
    // Définir l'ordre de tri
    let orderBy
    if (sort === 'popularity') {
      // Pour la popularité, récupérer les données puis trier
      orderBy = { createdAt: 'desc' }
    } else {
      orderBy = { createdAt: 'desc' }
    }
    
    // Récupérer le total des idées
    const total = await prisma.idea.count()
    
    // Récupérer les idées avec pagination
    const ideas = await prisma.idea.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        votes: true,
        comments: {
          select: {
            id: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const formattedIdeas = ideas.map(idea => {
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
        commentsCount: idea.comments.length,
        userVote,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      }
    })
    
    // Trier par popularité si demandé (après avoir calculé les votes)
    if (sort === 'popularity') {
      formattedIdeas.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    }
    
    return {
      ideas: formattedIdeas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des idées:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
