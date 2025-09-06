# Qwen Code Reference

## Project: Next.js 15 School Management System with MySQL

### Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Development Setup

- Next.js 15 with App Router
- TypeScript with strict mode
- Tailwind CSS for styling
- shadcn/ui component library
- MySQL database with mysql2
- Modular architecture with service layer
- Turbopack for faster development

### Database

- MySQL database with Prisma ORM
- Connection pooling configured
- Environment variables in `.env.local`
- Database utilities in `/src/lib/db-utils.ts` and `/src/lib/prisma.ts`
- Migration system with `/api/init-db`, `/api/migrate`, `/api/seed-users`
- Prisma schema in `prisma/schema.prisma`

### Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages with layout
│   ├── login/              # Authentication pages
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
│   │   ├── service.ts     # Task business logic with Prisma
│   │   └── controller.ts  # Task API request handling
│   ├── subtasks/          # Subtask management module
│   │   ├── types.ts       # Subtask type definitions
│   │   ├── validation.ts  # Subtask validation rules
│   │   ├── service.ts     # Subtask business logic
│   │   └── controller.ts  # Subtask API request handling
│   └── settings/          # App settings module
│       ├── types.ts       # Settings type definitions
│       └── service.ts     # Settings business logic
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
- **Task Management**: Complete CRUD operations with subtasks and image attachments
- **Modular Architecture**: Separation of concerns with service layer
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Structured error responses with status codes
- **Database Operations**: CRUD operations with Prisma ORM
- **Migration System**: Database setup and seeding utilities
- **Settings Management**: Configurable app settings with categories
- **File Upload**: Image attachments for subtasks and documentation

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login with validation
- `POST /api/auth/register` - User registration

#### Tasks Management

- `GET /api/tasks` - List all tasks with subtasks and images
- `GET /api/tasks/kanban` - Get tasks grouped by status (Kanban view)
- `GET /api/tasks/[id]` - Get single task with full relations
- `POST /api/tasks` - Create new task with optional subtasks
- `PUT /api/tasks/[id]` - Update task details and status
- `DELETE /api/tasks/[id]` - Delete task and cascade to subtasks

#### Subtasks Management

- `GET /api/subtasks` - List all subtasks with relations
- `GET /api/subtasks/by-task/[taskId]` - Get subtasks for specific task
- `GET /api/subtasks/[id]` - Get single subtask with images
- `POST /api/subtasks` - Create new subtask
- `PUT /api/subtasks/[id]` - Update subtask (title, description, completion status)
- `DELETE /api/subtasks/[id]` - Delete subtask and associated documentation

#### Users Management

- `GET /api/users` - List users with pagination & filters
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Soft delete user
- `GET /api/users/by-role?role=admin` - Get users by role

#### Settings Management

- `GET /api/settings` - Get all app settings by category
- `GET /api/settings/[category]` - Get settings for specific category
- `PUT /api/settings` - Update multiple settings at once
- `PUT /api/settings/[key]` - Update single setting value

#### System

- `POST /api/init-db` - Initialize database tables
- `POST /api/migrate` - Create admin and sample data
- `POST /api/seed-users` - Create test users
- `GET /api/migrations` - View migration documentation
- `POST /api/rollback` - Rollback data

### Data Models

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
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
}
```

#### Subtask Model

```typescript
interface Subtask {
  subtask_id: number;
  task_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  status: 'todo' | 'done';
  created_at: string;
  updated_at: string;
  images: SubtaskImage[];
}
```

#### SubtaskImage Model

```typescript
interface SubtaskImage {
  image_id: number;
  url: string;
  uploaded_at: string;
}
```

### UI Components

#### Task Management UI

- **TaskCard**: Displays task overview with subtask count and image indicators
- **SubtaskDetailDialog**: Shows subtask details with image grid and completion status
- **Kanban Board**: Visual task management with drag-and-drop (status-based columns)
- **Task Form**: Create/edit tasks with subtask management

#### Component Features

- Responsive design with Tailwind CSS
- Image preview with hover effects
- Real-time status updates
- Nested task-subtask relationships
- File upload integration

### Development Workflow

1. **Setup**: Run migrations to initialize database with `npm run migrate`
2. **Seed Data**: Use `POST /api/seed-users` and custom seed scripts
3. **Authentication**: Login with test accounts (admin@qwen-code.com / password123)
4. **Task Management**: Use dashboard to create and manage tasks with subtasks
5. **API Testing**: Import Postman collection from `docs/postman-collection.json`
6. **Database Visualization**: Use tools like MySQL Workbench or online ERD generators