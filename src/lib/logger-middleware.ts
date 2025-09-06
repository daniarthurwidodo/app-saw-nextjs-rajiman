import { NextRequest, NextResponse } from 'next/server';
import logger from './logger';

// Helper function to wrap API route handlers with logging
export function withLogger(handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, ctx?: any) => {
    const startTime = Date.now();

    try {
      logger.info(
        {
          method: req.method,
          url: req.url,
          query: Object.fromEntries(req.nextUrl.searchParams),
        },
        'API Request started'
      );

      const result = await handler(req, ctx);

      const duration = Date.now() - startTime;
      logger.info(
        {
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          statusCode: result?.status,
        },
        'API Request completed'
      );

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(
        {
          method: req.method,
          url: req.url,
          error: error.message,
          stack: error.stack,
          duration: `${duration}ms`,
        },
        'API Request failed'
      );

      // Re-throw the error to be handled by the route handler
      throw error;
    }
  };
}

// Simple request logger for middleware
export function logRequest(request: NextRequest) {
  logger.info(
    {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    },
    'Incoming request'
  );
}
