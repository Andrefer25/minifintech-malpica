import { FastifyInstance, FastifyReply } from 'fastify';
import {
  GetDashboardStatsUseCase,
  GET_DASHBOARD_STATS_USE_CASE,
} from '../../../application/get-dashboard-stats/get-dashboard-stats.use-case';
import { authMiddleware } from '../middleware/auth.middleware';
import { authHeaderSchema } from '../dto/common.dto';
import { dashboardResponseSchema } from '../dto/dashboard.dto';

export async function dashboardRoutes(fastify: FastifyInstance) {
  const getDashboardStatsUseCase = fastify.container.resolve<GetDashboardStatsUseCase>(
    GET_DASHBOARD_STATS_USE_CASE,
  );

  fastify.get('/dashboard', {
    preHandler: authMiddleware,
    schema: {
      tags: ['dashboard'],
      description: 'Aggregated KPIs for the dashboard view. Daily metrics use UTC boundaries.',
      headers: authHeaderSchema,
      response: { 200: dashboardResponseSchema },
    },
  }, async (_request, reply: FastifyReply) => {
    const stats = await getDashboardStatsUseCase.execute();
    return reply.send(stats);
  });
}
