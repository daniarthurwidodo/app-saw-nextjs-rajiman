# Qwen Code Reference

## Project: Next.js 15 School Management System with MySQL

### Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode

### Development Setup

- Next.js 15 with App Router
- TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui component library
- MySQL database with mysql2
- Prisma ORM for database operations
- Modular architecture with service layer
- Turbopack for faster development

### Database

- MySQL database with Prisma ORM
- Connection pooling configured
- Environment variables in `.env.local`
- Database utilities in `/src/lib/db.ts`
- Migration system with `/api/init-db`, `/api/migrate`, `/api/seed-users`
- Prisma schema in `prisma/schema.prisma`
- Seed scripts in `prisma/seed/`

### Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages with layout
│   ├── login/              # Authentication pages
│   ├── register/           # User registration pages
│   ├── tasks/              # Task management pages
│   ├── users/              # User management pages
│   └── api/                # API routes
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui base components
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/                    # Utility libraries
│   ├── db.ts              # Database connection & pooling
│   └── utils.ts           # General utilities
├── modules/                # Business logic modules
│   ├── auth/              # Authentication module
│   │   ├── types.ts       # Auth type definitions
│   │   ├── validation.ts  # Input validation & sanitization
│   │   ├── service.ts     # Business logic layer
│   │   └── controller.ts  # API request handling
│   ├── users/             # User management module
│   │   ├── types.ts       # User type definitions
│   │   ├── validation.ts  # Input validation & sanitization
│   │   ├── service.ts     # Business logic layer
│   │   └── controller.ts  # API request handling
│   ├── tasks/             # Task management module
│   │   ├── types.ts       # Task & subtask type definitions
│   │   ├── validation.ts  # Task validation rules
│   │   ├── service.ts     # Task business logic
│   │   └── controller.ts  # Task API request handling
│   ├── subtasks/          # Subtask management module
│   │   ├── types.ts       # Subtask type definitions
│   │   ├── validation.ts  # Subtask validation rules
│   │   ├── service.ts     # Subtask business logic
│   │   └── controller.ts  # Subtask API request handling
│   └── dashboard/         # Dashboard module
│       └── service.ts     # Dashboard business logic
└── types/                  # Global TypeScript definitions
    └── index.ts           # Enums & interfaces
```

### Module Structure (MVC Pattern)

Each module follows a consistent structure:

- **Types**: TypeScript interfaces and error classes
- **Validation**: Input sanitization and validation rules
- **Service**: Business logic and database operations
- **Controller**: HTTP request/response handling

### Key Features

- **Role-based Authentication**: Super Admin, Admin, Principal, User
- **Task Management**: Complete CRUD operations with subtasks
- **Document Management**: File uploads and attachments
- **Reporting System**: Rating system with comments
- **Decision Support**: Criteria weighting for decision making
- **Modular Architecture**: Separation of concerns with service layer
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Structured error responses with status codes
- **Database Operations**: CRUD operations with mysql2 driver
- **Migration System**: Database setup and seeding utilities

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login with validation
- `POST /api/auth/register` - User registration

#### Tasks Management

- `GET /api/tasks` - List all tasks with subtasks
- `GET /api/tasks/kanban` - Get tasks grouped by status (Kanban view)
- `GET /api/tasks/[id]` - Get single task with full relations
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task details and status
- `DELETE /api/tasks/[id]` - Delete task

#### Subtasks Management

- `GET /api/subtasks` - List all subtasks
- `GET /api/subtasks/by-task/[taskId]` - Get subtasks for specific task
- `GET /api/subtasks/[id]` - Get single subtask
- `POST /api/subtasks` - Create new subtask
- `PUT /api/subtasks/[id]` - Update subtask
- `DELETE /api/subtasks/[id]` - Delete subtask

#### Users Management

- `GET /api/users` - List users with pagination & filters
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Soft delete user
- `GET /api/users/by-role?role=admin` - Get users by role

#### System

- `GET /api/test-db` - Test database connection
- `POST /api/init-db` - Initialize database tables
- `POST /api/migrate` - Create admin and sample data
- `POST /api/seed-users` - Create test users
- `GET /api/migrations` - View migration documentation
- `POST /api/rollback` - Rollback data

### Data Models

#### User Model

```typescript
interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'kepala_sekolah' | 'user';
  school_id?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
```

#### Task Model

```typescript
interface Task {
  task_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  created_by?: number;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by_user_id?: number;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}
```

#### Subtask Model

```typescript
interface Subtask {
  subtask_id: number;
  relation_task_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  is_completed?: boolean;
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}
```

### UI Components

#### Task Management UI

- **TaskCard**: Displays task overview with priority and status
- **KanbanBoard**: Visual task management with drag-and-drop columns
- **TaskForm**: Create/edit tasks with form validation
- **TaskDetailModal**: Detailed view of task information

#### Component Features

- Responsive design with Tailwind CSS
- Real-time status updates
- Nested task-subtask relationships
- File upload integration

### Development Workflow

1. **Setup**: Run migrations to initialize database
2. **Seed Data**: Use seeding scripts to populate test data
3. **Authentication**: Login with test accounts
4. **Task Management**: Use dashboard to create and manage tasks
5. **API Testing**: Import Postman collection for API testing