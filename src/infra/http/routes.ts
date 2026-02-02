import { FastifyInstance } from 'fastify'
import { organizationsRoutes } from './routes/organizations/routes'
import { sessionsRoutes } from './routes/sessions/routes'
import { petsRoutes } from './routes/pets/routes'
import { observabilityRoutes } from './routes/observability/routes'

export async function routes(app: FastifyInstance) {
  app.register(observabilityRoutes)
  app.register(organizationsRoutes)
  app.register(sessionsRoutes)
  app.register(petsRoutes)
}
