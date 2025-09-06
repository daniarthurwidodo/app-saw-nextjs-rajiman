# Logging System Documentation

This project uses Pino as its logging library, which provides a fast and structured logging solution.

## Setup

The logging system is automatically set up when you install the dependencies. The logger is configured differently for development and production environments:

- In development: Uses `pino-pretty` for colorful, human-readable logs
- In production: Outputs JSON formatted logs for better machine parsing

## Usage

### 1. Basic Logger Usage

To use the logger in any file, import it:

```typescript
import logger from '@/lib/logger';
```

Then use it with different log levels:

```typescript
logger.trace('Detailed trace information');
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning messages');
logger.error('Error messages');
logger.fatal('Fatal error messages');
```

### 2. Logging with Context

You can add context to your logs by passing an object as the first parameter:

```typescript
logger.info({ userId: 123, action: 'login' }, 'User logged in successfully');
logger.error({ userId: 123, error: error.message }, 'Failed to update user profile');
```

### 3. In Service Layers

The service layer methods have been updated to use structured logging:

```typescript
static async login(loginData: LoginRequest): Promise<LoginResponse> {
  try {
    logger.info({ email: loginData.email }, 'Login attempt started');
    
    // ... implementation
    
    logger.info({ userId: user.user_id, email: user.email }, 'Login successful');
    return result;
  } catch (error) {
    logger.error({ 
      email: loginData.email, 
      error: error.message,
      stack: error.stack
    }, 'Unexpected error during login');
    throw error;
  }
}
```

### 4. In API Routes

API routes use the `withLogger` middleware wrapper to automatically log requests:

```typescript
import { withLogger } from '@/lib/logger-middleware';

export async function POST(request: NextRequest) {
  return withLogger(async (req: NextRequest) => {
    // Your route implementation
    return await AuthController.login(req);
  })(request);
}
```

### 5. Middleware Logging

All incoming requests are automatically logged via the middleware in `src/middleware.ts`.

## Configuration

The logger is configured in `src/lib/logger.ts`:

- Log level is controlled by the `LOG_LEVEL` environment variable (defaults to 'info')
- In development, logs are formatted with colors and timestamps
- In production, logs are output as JSON for better parsing
- Sensitive data like passwords and emails are automatically redacted

## Best Practices

1. Use appropriate log levels:
   - `trace`: Extremely detailed debugging information
   - `debug`: Detailed debugging information
   - `info`: General operational information
   - `warn`: Warning conditions
   - `error`: Error conditions
   - `fatal`: Critical error conditions

2. Include relevant context in your logs:
   ```typescript
   // Good
   logger.info({ userId: user.id, taskId: task.id }, 'Task assigned to user');
   
   // Less useful
   logger.info('Task assigned');
   ```

3. Avoid logging sensitive information directly:
   ```typescript
   // Bad
   logger.info(`User password is ${password}`);
   
   // Good
   logger.info({ userId: user.id }, 'User password updated');
   ```

4. Log at the beginning and end of important operations:
   ```typescript
   logger.info({ operation: 'database_migration' }, 'Starting database migration');
   // ... migration code
   logger.info({ operation: 'database_migration' }, 'Database migration completed');
   ```

## Environment Variables

- `LOG_LEVEL`: Controls the minimum log level to output (trace, debug, info, warn, error, fatal)
- `NODE_ENV`: Affects the log format (development uses pretty formatting, production uses JSON)

Example .env configuration:
```
LOG_LEVEL=debug
NODE_ENV=development
```