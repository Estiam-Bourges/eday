import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification et le rôle admin
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès interdit - Administrateur requis'
    })
  }

  // Récupérer toutes les idées
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      // Ajout des likes/dislikes et du nombre de commentaires
      votes: { select: { type: true } },
      comments: { select: { id: true } }
    }
  })

  type Vote = { type: string }
  type Comment = { id: string }
  type Idea = {
    id: string
    title: string
    description: string
    status: string
    votes: Vote[]
    comments: Comment[]
  }

  // Calcul des likes/dislikes et du nombre de commentaires
  const formattedIdeas = (ideas as Idea[]).map((idea) => {
    const likes = idea.votes.filter((v: Vote) => v.type === 'UP').length
    const dislikes = idea.votes.filter((v: Vote) => v.type === 'DOWN').length
    const commentsCount = idea.comments.length
    return {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      status: idea.status,
      likes,
      dislikes,
      commentsCount
    }
  })

  return formattedIdeas
})
