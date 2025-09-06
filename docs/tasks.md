# Tasks and Subtasks Management

## Overview

The Task Management system provides a comprehensive solution for creating, managing, and tracking tasks with nested subtasks and image attachments. Built with Next.js 15, Prisma ORM, and MySQL for Qwen Code.

## Features

### Core Functionality

- ✅ Create, read, update, and delete tasks
- ✅ Nested subtask management with full CRUD operations
- ✅ Image attachments for subtasks (documentation/evidence)
- ✅ Task status tracking (todo, in_progress, done)
- ✅ Priority levels (low, medium, high)
- ✅ User assignment for tasks and subtasks
- ✅ Due date management
- ✅ Approval workflow system

### UI Components

- **Kanban Board**: Visual task management with status-based columns
- **Task Cards**: Overview cards showing task details and progress
- **Subtask Detail Dialog**: Modal for viewing/editing subtask details with images
- **Task Forms**: Create and edit tasks with subtask management
- **Image Gallery**: Responsive grid display for subtask images

## Database Schema

### Task Model

```sql
CREATE TABLE tasks (
  task_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT,
  created_by INT,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by_user_id INT,
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Subtask Model

```sql
CREATE TABLE subtasks (
  subtask_id INT PRIMARY KEY AUTO_INCREMENT,
  relation_task_id INT NOT NULL,
  subtask_title VARCHAR(255) NOT NULL,
  subtask_description TEXT,
  assigned_to INT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (relation_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);
```

### Documentation Model

```sql
CREATE TABLE documentation (
  doc_id INT PRIMARY KEY AUTO_INCREMENT,
  subtask_id INT,
  doc_type ENUM('documentation', 'payment', 'attendance'),
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE
);
```

## API Endpoints

### Tasks API

#### Get All Tasks

```http
GET /api/tasks
```

**Response Format:**

```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "tasks": [
    {
      "task_id": 1,
      "title": "Setup New School Registration System",
      "description": "Implement and configure the registration system",
      "assigned_to": 2,
      "created_by": 1,
      "status": "done",
      "priority": "high",
      "due_date": "2024-01-15",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "subtasks": [
        {
          "subtask_id": 1,
          "task_id": 1,
          "title": "Design database schema",
          "description": "Create ERD and database structure",
          "assigned_to": 2,
          "status": "done",
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z",
          "images": [
            {
              "image_id": 1,
              "url": "https://example.com/image1.jpg",
              "uploaded_at": "2024-01-01T00:00:00Z"
            }
          ]
        }
      ]
    }
  ]
}
```

#### Get Tasks for Kanban View

```http
GET /api/tasks/kanban
```

**Response:** Tasks grouped by status (todo, in_progress, done)

#### Get Single Task

```http
GET /api/tasks/{id}
```

#### Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task Example",
  "description": "Task description here",
  "assigned_to": 1,
  "priority": "high",
  "due_date": "2024-12-31"
}
```

#### Update Task

```http
PUT /api/tasks/{id}
Content-Type: application/json

{
  "title": "Updated Task Title",
  "status": "in_progress",
  "priority": "medium"
}
```

#### Delete Task

```http
DELETE /api/tasks/{id}
```

### Subtasks API

#### Get All Subtasks

```http
GET /api/subtasks
```

#### Get Subtasks by Task

```http
GET /api/subtasks/by-task/{taskId}
```

#### Get Single Subtask

```http
GET /api/subtasks/{id}
```

#### Create Subtask

```http
POST /api/subtasks
Content-Type: application/json

{
  "task_id": 1,
  "title": "New Subtask",
  "description": "Subtask description",
  "assigned_to": 1
}
```

#### Update Subtask

```http
PUT /api/subtasks/{id}
Content-Type: application/json

{
  "title": "Updated Subtask",
  "is_completed": true
}
```

#### Delete Subtask

```http
DELETE /api/subtasks/{id}
```

## Implementation Details

### Service Layer (Prisma ORM)

The task service uses Prisma ORM for database operations:

```typescript
// src/modules/tasks/service.ts
export class TasksService {
  static async getAllTasks(): Promise<TasksResponse> {
    const prismaTasksWithRelations = await prisma.task.findMany({
      include: {
        assignedUser: true,
        creator: true,
        approver: true,
        subtasks: {
          include: {
            assignedUser: true,
            documentation: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match API response format
    const tasks: Task[] = prismaTasksWithRelations.map((task) => ({
      task_id: task.id,
      title: task.title,
      description: task.description || undefined,
      assigned_to: task.assignedTo || undefined,
      created_by: task.createdBy || undefined,
      status: task.status as TaskStatus,
      priority: task.priority as Priority,
      due_date: task.dueDate ? task.dueDate.toISOString().split('T')[0] : undefined,
      created_at: task.createdAt?.toISOString() || '',
      updated_at: task.updatedAt?.toISOString() || '',
      subtasks: task.subtasks.map((subtask) => ({
        subtask_id: subtask.id,
        task_id: subtask.relationTaskId,
        title: subtask.title,
        description: subtask.description || undefined,
        assigned_to: subtask.assignedTo || undefined,
        status: subtask.isCompleted ? 'done' : 'todo',
        created_at: subtask.createdAt?.toISOString() || '',
        updated_at: subtask.updatedAt?.toISOString() || '',
        images: subtask.documentation.map((doc) => ({
          image_id: doc.id,
          url: doc.filePath || '',
          uploaded_at: doc.uploadedAt?.toISOString() || '',
        })),
      })),
    }));

    return {
      success: true,
      message: 'Tasks retrieved successfully',
      tasks,
    };
  }
}
```

### UI Components

#### TaskCard Component

```typescript
// src/components/TaskCard.tsx
export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.subtask_id} className="border-l-2 border-gray-200 pl-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${subtask.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                    {subtask.title}
                  </span>
                  <Badge variant={subtask.status === 'done' ? 'success' : 'secondary'}>
                    {subtask.status}
                  </Badge>
                </div>

                {subtask.images && subtask.images.length > 0 && (
                  <div className="flex items-center mt-1">
                    <ImageIcon className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-blue-500 text-xs">
                      {subtask.images.length} image{subtask.images.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Development Guide

### Setting Up Tasks

1. **Database Migration**

   ```bash
   npm run migrate
   ```

2. **Seed Sample Data**

   ```bash
   node scripts/seed-tasks-with-subtasks.js
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Testing API Endpoints

1. Import the Postman collection from `docs/postman-collection.json`
2. Set the base URL variable to `http://localhost:3000`
3. Test all endpoints with sample data

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma`
2. **Generate Prisma Client**: Run `npx prisma generate`
3. **Update Types**: Modify interfaces in `src/types/index.ts`
4. **Service Layer**: Add business logic in `src/modules/tasks/service.ts`
5. **API Routes**: Update controllers and route handlers
6. **UI Components**: Add/modify React components as needed

## Best Practices

### Error Handling

- Always use try-catch blocks in service methods
- Return structured error responses with appropriate HTTP status codes
- Log errors for debugging while protecting sensitive information

### Validation

- Validate all input data at the API level
- Use TypeScript interfaces for type safety
- Sanitize user input to prevent XSS attacks

### Performance

- Use Prisma's `include` option judiciously to avoid N+1 queries
- Implement pagination for large datasets
- Use database indexes on frequently queried columns

### Security

- Implement proper authorization checks
- Validate user permissions before allowing operations
- Use parameterized queries (handled by Prisma)

## Troubleshooting

### Common Issues

1. **Prisma Connection Errors**
   - Check database connection string in `.env`
   - Ensure MySQL server is running
   - Verify database exists and is accessible

2. **Type Errors**
   - Run `npx prisma generate` after schema changes
   - Check interface definitions in `src/types/index.ts`
   - Ensure Prisma client is properly imported

3. **API Response Format Issues**
   - Verify data transformation in service layer
   - Check that response matches expected interface
   - Use TypeScript strict mode to catch type mismatches

### Development Tools

- **Database GUI**: MySQL Workbench or phpMyAdmin
- **API Testing**: Postman collection provided
- **Code Quality**: ESLint and Prettier (to be configured)
- **Type Checking**: `npm run typecheck`
