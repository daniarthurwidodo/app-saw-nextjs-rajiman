#!/usr/bin/env node

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const settingsMigrationSQL = `
-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key),
  INDEX idx_category (category)
);

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value, setting_type, description, category) VALUES
('app_name', 'Claude Code - School Management System', 'string', 'Application name displayed in interface', 'general'),
('app_description', 'A comprehensive school management and task tracking system', 'string', 'Application description', 'general'),
('admin_email', 'admin@school-system.com', 'string', 'Primary administrator email', 'general'),
('timezone', 'Asia/Jakarta', 'string', 'Default system timezone', 'general'),
('date_format', 'DD/MM/YYYY', 'string', 'Default date format', 'general'),
('language', 'en', 'string', 'Default system language', 'general'),
('theme', 'light', 'string', 'Default theme', 'appearance'),
('email_notifications', 'true', 'boolean', 'Enable email notifications', 'notifications'),
('task_reminders', 'true', 'boolean', 'Enable task deadline reminders', 'notifications'),
('system_alerts', 'true', 'boolean', 'Enable system maintenance alerts', 'notifications'),
('digest_frequency', 'daily', 'string', 'Email digest frequency', 'notifications'),
('password_min_length', '6', 'number', 'Minimum password length', 'security'),
('session_timeout', '30', 'number', 'Session timeout in minutes', 'security'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout', 'security'),
('require_2fa', 'false', 'boolean', 'Require two-factor authentication', 'security')
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = CURRENT_TIMESTAMP;
`;

async function runSettingsMigration() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: true
  };

  console.log('🔧 Running settings migration...');
  console.log(`📍 Database: ${config.database}`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Execute migration
    await connection.query(settingsMigrationSQL);
    console.log('✅ Settings migration completed successfully');

    // Verify the migration
    const [settings] = await connection.query('SELECT COUNT(*) as count FROM app_settings');
    console.log(`📋 Settings records: ${settings[0].count}`);

    // Show some sample settings
    const [sampleSettings] = await connection.query(`
      SELECT setting_key, setting_value, category 
      FROM app_settings 
      WHERE category IN ('general', 'security') 
      LIMIT 5
    `);
    
    console.log('📋 Sample settings:');
    sampleSettings.forEach(setting => {
      console.log(`   ✓ ${setting.setting_key}: ${setting.setting_value} (${setting.category})`);
    });

    await connection.end();
    console.log('🎉 Settings migration complete!');

  } catch (error) {
    console.error('❌ Settings migration failed:');
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`   - Database '${config.database}' does not exist`);
      console.error('   - Run: npm run db:create && npm run db:init');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   - Cannot connect to MySQL server');
      console.error(`   - Check connection to ${config.host}:${config.port}`);
    } else {
      console.error(`   - ${error.message}`);
    }
    
    process.exit(1);
  }
}

runSettingsMigration();