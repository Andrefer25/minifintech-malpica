export const dashboardResponseSchema = {
  type: 'object',
  properties: {
    totalUsers: { type: 'integer' },
    totalBalance: { type: 'number' },
    transactionsToday: { type: 'integer' },
    volumeToday: { type: 'number' },
    pendingCount: { type: 'integer' },
    approvedCount: { type: 'integer' },
    rejectedCount: { type: 'integer' },
  },
};
