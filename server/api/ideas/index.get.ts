import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
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
      orderBy: {
        createdAt: 'desc'
      }
    })

    return ideas.map(idea => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      upvotes: idea.votes.filter(v => v.type === 'UP').length,
      downvotes: idea.votes.filter(v => v.type === 'DOWN').length,
      commentsCount: idea.comments.length,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des idées:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
