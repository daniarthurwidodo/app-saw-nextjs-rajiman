# Claude Code Reference

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
- MySQL connection using mysql2 
- Connection pooling configured
- Environment variables in `.env.local`
- Database utilities in `/src/lib/db.ts`
- Migration system with `/api/init-db`, `/api/migrate`, `/api/seed-users`

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
│   └── users/             # User management module
│       ├── types.ts       # User type definitions  
│       ├── validation.ts  # Input validation & sanitization
│       ├── service.ts     # Business logic layer
│       └── controller.ts  # API request handling
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
- **Role-based Authentication**: Super Admin, Admin, Principal, Staff
- **Modular Architecture**: Separation of concerns with service layer
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Structured error responses with status codes
- **Database Operations**: CRUD operations with proper error handling
- **Migration System**: Database setup and seeding utilities

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login with validation
- `POST /api/auth/register` - User registration

#### Users Management
- `GET /api/users` - List users with pagination & filters
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Soft delete user
- `GET /api/users/by-role?role=admin` - Get users by role
- `GET /api/users/by-school?school_id=1` - Get users by school

#### System
- `POST /api/init-db` - Initialize database tables
- `POST /api/migrate` - Create admin and sample data
- `POST /api/seed-users` - Create test users
- `GET /api/migrations` - View migration documentation
- `POST /api/rollback` - Rollback data

### Development Workflow
1. **Setup**: Run migrations to initialize database
2. **Authentication**: Login with test accounts
3. **User Management**: Use `/users` page to manage users
4. **API Testing**: Import Postman collection for endpoint testing