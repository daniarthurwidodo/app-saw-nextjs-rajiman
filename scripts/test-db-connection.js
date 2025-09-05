const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { join } = require('path');

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

async function syncDatabase() {
  // First test MySQL connection
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT)
    });

    console.log('✅ MySQL Connection successful');
    
    // Test query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📊 Current tables:', rows);

    await connection.end();

    // Now test Prisma connection
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Prisma Connection successful');

    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncDatabase();
