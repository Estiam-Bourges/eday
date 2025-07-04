import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED']

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

  const body = await readBody(event)
  const { status } = body || {}
  if (!allowedStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Statut invalide'
    })
  }

  const idea = await prisma.idea.update({
    where: { id },
    data: { status }
  })

  return { success: true, idea }
})
