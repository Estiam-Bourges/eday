import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    const { title, description } = await readBody(event)

    // Validation des données
    if (!title || !description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre et la description sont requis'
      })
    }

    if (title.length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le titre ne peut pas dépasser 100 caractères'
      })
    }

    if (description.length > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La description ne peut pas dépasser 1000 caractères'
      })
    }

    const idea = await prisma.idea.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        authorId: user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la création de l\'idée:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})