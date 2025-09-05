import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(dirname(__dirname), '.env.local') });

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
