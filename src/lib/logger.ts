import pino from 'pino';

// Simple logger configuration without transport to avoid worker thread issues
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'email',
      'authorization',
      'cookie',
      '*.password',
      '*.email',
      '*.authorization',
      '*.cookie',
    ],
    remove: true,
  },
});

export default logger;
