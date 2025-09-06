// Test file to verify tasks module logging functionality
import logger from '@/lib/logger';

// Test logging in tasks context
logger.info({ module: 'tasks' }, 'Tasks module logging test');
logger.debug({ taskId: 123, action: 'create' }, 'Creating new task');
logger.warn({ taskId: 456, warning: 'low_priority' }, 'Task has low priority');
logger.error({ taskId: 789, error: 'database_connection' }, 'Failed to connect to database');

console.log('Tasks module logging test completed');
