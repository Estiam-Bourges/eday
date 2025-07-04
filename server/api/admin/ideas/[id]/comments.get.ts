import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit - Administrateur requis'
    })
  }

  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID d\'idée manquant'
    })
  }

  // Récupérer les commentaires de l'idée
  const comments = await prisma.comment.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { name: true } } }
  })

  return comments
})
