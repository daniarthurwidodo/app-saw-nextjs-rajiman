// Test file to verify logging functionality
import logger from '@/lib/logger';

// Test different log levels
logger.trace('This is a trace message');
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.fatal('This is a fatal message');

// Test logging with context
logger.info({ userId: 123, action: 'login' }, 'User performed login');
logger.error({ userId: 456, error: 'Connection timeout' }, 'Failed to connect to database');

console.log('Logging test completed');
