import { describe, it, expect, vi } from 'vitest';

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: { status?: number; headers?: Record<string, string> }) => {
        return new Response(JSON.stringify(body), {
          status: init?.status ?? 200,
          headers: new Headers(init?.headers),
        });
      },
    },
  };
});

import { apiError, apiJson, getCorrelationId } from '@/lib/api-error';

describe('api-error', () => {
  describe('getCorrelationId', () => {
    it('returns correlation id from headers if present', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-correlation-id': '  test-id  ' },
      });
      expect(getCorrelationId(req)).toBe('test-id');
    });

    it('generates a new correlation id if header is missing', () => {
      const req = new Request('http://localhost');
      const id = getCorrelationId(req);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('apiJson', () => {
    it('returns a successful json response', async () => {
      const res = apiJson({ data: 'success' });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ data: 'success' });
      expect(res.headers.get('x-correlation-id')).toBeDefined();
    });

    it('allows passing custom status and correlation id', async () => {
      const res = apiJson({ data: 'success' }, 201, 'custom-id');
      expect(res.status).toBe(201);
      expect(res.headers.get('x-correlation-id')).toBe('custom-id');
    });
  });

  describe('apiError', () => {
    it('formats basic error correctly', async () => {
      const res = apiError(400, 'VALIDATION_ERROR', 'Invalid input');
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      });
      expect(res.headers.get('x-correlation-id')).toBeDefined();
    });

    it('includes details if provided', async () => {
      const res = apiError(404, 'NOT_FOUND', 'User not found', { userId: 123 });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toEqual({
        code: 'NOT_FOUND',
        message: 'User not found',
        details: { userId: 123 },
      });
    });

    it('passes correlation id and extra headers', async () => {
      const res = apiError(
        500,
        'INTERNAL_SERVER_ERROR',
        'Something went wrong',
        undefined,
        'error-id',
        { 'x-custom-header': 'value' }
      );

      expect(res.status).toBe(500);
      expect(res.headers.get('x-correlation-id')).toBe('error-id');
      expect(res.headers.get('x-custom-header')).toBe('value');
    });
  });
});
