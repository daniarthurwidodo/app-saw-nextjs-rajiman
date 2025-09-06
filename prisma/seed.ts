import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@claudecode.com' },
    });

    if (!adminExists) {
      const hashedPassword = await hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: 'admin@claudecode.com',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
        },
      });
      console.log('✅ Created admin user: admin@claudecode.com');
    }

    // Sample schools data
    const sampleSchools = [
      {
        name: 'SDN 01 Jakarta',
        address: 'Jl. Merdeka No. 123, Jakarta Pusat',
        contact: '021-1234567',
      },
      {
        name: 'SMP 05 Bandung',
        address: 'Jl. Asia Afrika No. 456, Bandung',
        contact: '022-7654321',
      },
      {
        name: 'SMA 03 Surabaya',
        address: 'Jl. Pahlawan No. 789, Surabaya',
        contact: '031-9876543',
      },
    ];

    for (const school of sampleSchools) {
      const exists = await prisma.school.findFirst({
        where: { name: school.name },
      });

      if (!exists) {
        await prisma.school.create({
          data: school,
        });
        console.log(`✅ Created school: ${school.name}`);
      }
    }

    // Sample criteria data
    const sampleCriteria = [
      {
        name: 'Academic Performance',
        weight: 30.0,
        description: 'Student academic achievements and test scores',
      },
      {
        name: 'Infrastructure Quality',
        weight: 25.0,
        description: 'School facilities and infrastructure condition',
      },
      {
        name: 'Teacher Quality',
        weight: 20.0,
        description: 'Teacher qualifications and performance',
      },
      {
        name: 'Student Attendance',
        weight: 15.0,
        description: 'Student attendance and participation rates',
      },
      {
        name: 'Community Engagement',
        weight: 10.0,
        description: 'Involvement with local community',
      },
    ];

    for (const criteria of sampleCriteria) {
      const exists = await prisma.criteria.findFirst({
        where: { name: criteria.name },
      });

      if (!exists) {
        await prisma.criteria.create({
          data: criteria,
        });
        console.log(`✅ Created criteria: ${criteria.name}`);
      }
    }

    // Default app settings
    const defaultSettings = [
      { key: 'site_name', value: 'Qwen Code - School Management System', category: 'general' },
      { key: 'session_timeout', value: '30', category: 'security' },
      { key: 'max_login_attempts', value: '5', category: 'security' },
      { key: 'require_2fa', value: 'false', category: 'security' },
    ];

    for (const setting of defaultSettings) {
      const exists = await prisma.appSetting.findUnique({
        where: { key: setting.key },
      });

      if (!exists) {
        await prisma.appSetting.create({
          data: setting,
        });
        console.log(`✅ Created setting: ${setting.key}`);
      }
    }

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
