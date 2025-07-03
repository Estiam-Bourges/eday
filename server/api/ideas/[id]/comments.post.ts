import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const user = await requireAuth(event)

    const ideaId = getRouterParam(event, 'id')
    const { content } = await readBody(event)

    if (!ideaId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'idée requis'
      })
    }

    if (!content || content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le contenu du commentaire est requis'
      })
    }

    if (content.length > 500) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le commentaire ne peut pas dépasser 500 caractères'
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

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        ideaId: ideaId,
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
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Erreur lors de la création du commentaire:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})