import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'claude_code_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, params?: any[]) {
  try {
    // Debug logging for parameter issues
    if (process.env.NODE_ENV === 'development') {
      console.log('SQL:', sql.replace(/\s+/g, ' ').trim());
      console.log('Params:', params);
    }

    // For now, let's use regular query() for all SELECT statements to avoid prepared statement issues
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      // Build the SQL string manually for SELECT statements
      let finalSql = sql;
      if (params && params.length > 0) {
        // Replace ? placeholders with actual escaped values
        let paramIndex = 0;
        finalSql = sql.replace(/\?/g, () => {
          if (paramIndex < params.length) {
            const param = params[paramIndex++];
            // Safely escape the parameter based on type
            if (param === null || param === undefined) {
              return 'NULL';
            } else if (typeof param === 'string') {
              return pool.escape(param);
            } else if (typeof param === 'number') {
              return param.toString();
            } else if (typeof param === 'boolean') {
              return param ? '1' : '0';
            } else {
              return pool.escape(param.toString());
            }
          }
          return '?';
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Final SQL:', finalSql.replace(/\s+/g, ' ').trim());
      }

      const [results] = await pool.query(finalSql);
      return results;
    } else {
      // For INSERT, UPDATE, DELETE - use prepared statements
      const cleanParams = params ? params.map((param) => (param === undefined ? null : param)) : [];
      const [results] = await pool.execute(sql, cleanParams);
      return results;
    }
  } catch (error: any) {
    console.error('Database query error:', error);

    // Provide helpful error message for common database issues
    if (error.code === 'ER_BAD_DB_ERROR') {
      const dbName = process.env.DB_NAME || 'claude_code_db';
      throw new Error(
        `Database '${dbName}' does not exist. Please create it first:\n` +
          `1. Run: POST /api/create-db\n` +
          `2. Or manually: CREATE DATABASE ${dbName};\n` +
          `3. Then run: POST /api/init-db`
      );
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Cannot connect to MySQL server. Please check:\n` +
          `1. MySQL server is running\n` +
          `2. Host: ${process.env.DB_HOST || 'localhost'}\n` +
          `3. Port: ${process.env.DB_PORT || 3306}\n` +
          `4. Credentials in .env.local`
      );
    }

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error(
        `Access denied. Please check:\n` +
          `1. Username: ${process.env.DB_USER || 'root'}\n` +
          `2. Password in .env.local\n` +
          `3. User has proper privileges`
      );
    }

    throw error;
  }
}

// Graceful shutdown handling
let isShuttingDown = false;

export async function closePool() {
  if (isShuttingDown) return;

  isShuttingDown = true;
  console.log('🔄 Closing database connection pool...');

  try {
    await pool.end();
    console.log('✅ Database connection pool closed successfully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
}

// Handle process termination signals
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT (Ctrl+C), shutting down gracefully...');
    await closePool();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await closePool();
    process.exit(0);
  });

  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await closePool();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await closePool();
    process.exit(1);
  });

  // Gracefully close connections when the process is about to exit
  process.on('beforeExit', async (code) => {
    if (!isShuttingDown) {
      console.log('🔄 Process beforeExit, closing database connections...');
      await closePool();
    }
  });
}

export default pool;
