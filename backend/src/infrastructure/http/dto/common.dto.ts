export const authHeaderSchema = {
  type: 'object',
  properties: {
    'x-user-id': { type: 'string', format: 'uuid' },
  },
};

export interface IdParams {
  id: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Number of items per page' },
  },
};
