import { prisma } from './prisma';
import { TaskStatus, Role, DocType } from '@prisma/client';
import type { 
  Task,
  Subtask,
  Documentation,
  Report,
  AppSetting,
  School,
  User,
  Prisma
} from '@prisma/client';

type CreateTaskInput = {
  title: string;
  description?: string;
  assignedTo?: number;
  createdBy: number;
  status?: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  subtasks?: Array<{
    title: string;
    description?: string;
    assignedTo?: number;
    isCompleted?: boolean;
  }>;
};

// Task-related functions
export async function getTasks(includeRelations = true) {
  return prisma.task.findMany({
    include: includeRelations ? {
      assignedUser: true,
      creator: true,
      approver: true,
      subtasks: {
        include: {
          assignedUser: true
        }
      }
    } : undefined,
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getTasksByStatus(status: Prisma.Enumerable<Prisma.TaskStatusType>) {
  return prisma.task.findMany({
    where: {
      status
    },
    include: {
      assignedUser: true,
      creator: true,
      approver: true,
      subtasks: {
        include: {
          assignedUser: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createTask(data: any) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      createdBy: data.createdBy,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      approvalStatus: data.approvalStatus || 'pending',
      subtasks: data.subtasks ? {
        create: data.subtasks.map((subtask: any) => ({
          title: subtask.title,
          description: subtask.description,
          assignedTo: subtask.assignedTo,
          isCompleted: subtask.isCompleted || false
        }))
      } : undefined
    },
    include: {
      assignedUser: true,
      creator: true,
      approver: true,
      subtasks: {
        include: {
          assignedUser: true
        }
      }
    }
  });
}

// Subtask-related functions
export async function createSubtask(data: any) {
  return prisma.subtask.create({
    data: {
      relationTaskId: data.relationTaskId,
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      isCompleted: data.isCompleted || false
    },
    include: {
      assignedUser: true,
      task: true
    }
  });
}

export async function updateSubtask(id: number, data: any) {
  return prisma.subtask.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      isCompleted: data.isCompleted
    },
    include: {
      assignedUser: true,
      task: true
    }
  });
}

// User-related functions
export async function getUsers(role?: string) {
  return prisma.user.findMany({
    where: role ? {
      role: role as any
    } : undefined,
    include: {
      school: true,
      assignedTasks: true,
      createdTasks: true
    }
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      school: true,
      assignedTasks: true,
      createdTasks: true
    }
  });
}

// Settings-related functions
export async function getSettings() {
  return prisma.appSetting.findMany({
    orderBy: [
      { category: 'asc' },
      { key: 'asc' }
    ]
  });
}

export async function updateSetting(key: string, value: string) {
  return prisma.appSetting.update({
    where: { key },
    data: { value }
  });
}

// School-related functions
export async function getSchools() {
  return prisma.school.findMany({
    include: {
      principal: true,
      users: true
    }
  });
}

// Report-related functions
export async function getReports() {
  return prisma.report.findMany({
    include: {
      task: true,
      creator: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createReport(data: any) {
  return prisma.report.create({
    data: {
      taskId: data.taskId,
      createdBy: data.createdBy,
      reportData: data.reportData,
      rating: data.rating,
      comment: data.comment
    },
    include: {
      task: true,
      creator: true
    }
  });
}

// Documentation-related functions
export async function getDocumentation(subtaskId?: number) {
  return prisma.documentation.findMany({
    where: subtaskId ? {
      subtaskId
    } : undefined,
    include: {
      subtask: true,
      uploader: true
    },
    orderBy: {
      uploadedAt: 'desc'
    }
  });
}

export async function createDocumentation(data: any) {
  return prisma.documentation.create({
    data: {
      subtaskId: data.subtaskId,
      docType: data.docType,
      filePath: data.filePath,
      fileName: data.fileName,
      uploadedBy: data.uploadedBy
    },
    include: {
      subtask: true,
      uploader: true
    }
  });
}
