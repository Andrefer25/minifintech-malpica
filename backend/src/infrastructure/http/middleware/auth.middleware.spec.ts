import { authMiddleware } from './auth.middleware';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('Auth Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let replyStatusSpy: jest.Mock;
  let replySendSpy: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };

    replyStatusSpy = jest.fn().mockReturnThis();
    replySendSpy = jest.fn().mockReturnThis();

    mockReply = {
      status: replyStatusSpy,
      send: replySendSpy,
    };
  });

  describe('when x-user-id header is missing', () => {
    it('should return 401 with error message', async () => {
      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({ message: 'Encabezado x-user-id requerido' });
    });
  });

  describe('when x-user-id header is present', () => {
    it('should accept valid UUID format', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).not.toHaveBeenCalled();
      expect((mockRequest as any).userId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should accept UUID with uppercase letters', async () => {
      mockRequest.headers = {
        'x-user-id': '123E4567-E89B-12D3-A456-426614174000',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).not.toHaveBeenCalled();
      expect((mockRequest as any).userId).toBe('123E4567-E89B-12D3-A456-426614174000');
    });

    it('should reject invalid UUID format', async () => {
      mockRequest.headers = {
        'x-user-id': 'invalid-uuid',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({ message: 'Formato de x-user-id inválido' });
    });

    it('should reject empty string', async () => {
      mockRequest.headers = {
        'x-user-id': '',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({ message: 'Encabezado x-user-id requerido' });
    });

    it('should reject partial UUID', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({ message: 'Formato de x-user-id inválido' });
    });

    it('should reject UUID with extra characters', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567-e89b-12d3-a456-426614174000-extra',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).toHaveBeenCalledWith(401);
      expect(replySendSpy).toHaveBeenCalledWith({ message: 'Formato de x-user-id inválido' });
    });
  });

  describe('header case sensitivity', () => {
    it('should accept x-user-id in lowercase', async () => {
      mockRequest.headers = {
        'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).not.toHaveBeenCalled();
    });

    it('should accept X-User-Id in mixed case', async () => {
      mockRequest.headers = {
        'X-User-Id': '123e4567-e89b-12d3-a456-426614174000',
      };

      await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(replyStatusSpy).not.toHaveBeenCalled();
    });
  });
});
