import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST() {
  try {
    // Create connection without database name
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port: Number(process.env.DB_PORT) || 3306,
    });

    // Create the database
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'claude_code_db'}`
    );

    // Close connection
    await connection.end();

    return NextResponse.json({
      success: true,
      message: `Database '${process.env.DB_NAME || 'claude_code_db'}' created successfully`,
      nextStep: 'Run POST /api/init-db to create tables',
    });
  } catch (error) {
    console.error('Database creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create database',
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: {
          checkCredentials: 'Verify DB_USER and DB_PASSWORD in .env.local',
          checkConnection: 'Ensure MySQL is running on the specified host/port',
          checkPermissions: 'Ensure the user has CREATE database privileges',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Database Creation Endpoint',
    usage: {
      method: 'POST',
      description: 'Creates the claude_code_db database if it does not exist',
      requirements: [
        'MySQL server must be running',
        'Database user must have CREATE privileges',
        'Correct credentials in .env.local',
      ],
    },
    currentConfig: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'claude_code_db',
      port: process.env.DB_PORT || '3306',
    },
  });
}
