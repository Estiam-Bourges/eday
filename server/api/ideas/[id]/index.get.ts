import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const ideaId = getRouterParam(event, 'id')
    
    if (!ideaId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'idée requis'
      })
    }

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
            createdAt: 'asc'
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

    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      upvotes: idea.votes.filter(v => v.type === 'UP').length,
      downvotes: idea.votes.filter(v => v.type === 'DOWN').length,
      comments: idea.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt
      })),
      createdAt: idea.createdAt
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la récupération de l\'idée:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
