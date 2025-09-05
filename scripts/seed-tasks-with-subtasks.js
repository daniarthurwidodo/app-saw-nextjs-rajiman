import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTasksWithSubtasks() {
  try {
    console.log('🌱 Starting task and subtask seeding...');

    // Make sure we have users first (get any existing users)
    const users = await prisma.user.findMany({
      take: 10,
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users in the database. Please run user seeding first.');
      return;
    }

    // Create a sample task
    const task = await prisma.task.create({
      data: {
        title: 'Setup New School Registration System',
        description:
          'Implement and configure the new school registration system for incoming students',
        assignedTo: users[0]?.id, // Assign to first user
        createdBy: users[1]?.id, // Created by second user
        status: 'done',
        priority: 'high',
        approvalStatus: 'pending',
      },
    });

    console.log(`✓ Created task: ${task.title} (ID: ${task.id})`);

    // Create subtasks
    const subtasksData = [
      { title: 'Research available systems', isCompleted: true },
      { title: 'Select the best system', isCompleted: true },
      { title: 'Configure the system', isCompleted: true },
      { title: 'Test the system', isCompleted: true },
      { title: 'Train staff on using the system', isCompleted: true },
    ];

    for (const subtaskData of subtasksData) {
      const subtask = await prisma.subtask.create({
        data: {
          relationTaskId: task.id,
          title: subtaskData.title,
          isCompleted: subtaskData.isCompleted,
          assignedTo: users[0]?.id,
        },
      });

      console.log(`✓ Created subtask: ${subtask.title} (ID: ${subtask.id})`);

      // Add sample images/documentation for the first subtask
      if (subtask.title === 'Research available systems') {
        await prisma.documentation.createMany({
          data: [
            {
              subtaskId: subtask.id,
              docType: 'documentation',
              filePath: 'https://example.com/images/research1.png',
              fileName: 'research1.png',
              uploadedBy: users[0]?.id,
            },
            {
              subtaskId: subtask.id,
              docType: 'documentation',
              filePath: 'https://example.com/images/research2.png',
              fileName: 'research2.png',
              uploadedBy: users[0]?.id,
            },
          ],
        });

        console.log(`✓ Added documentation for subtask: ${subtask.title}`);
      }
    }

    console.log('🎉 Task and subtask seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTasksWithSubtasks();
