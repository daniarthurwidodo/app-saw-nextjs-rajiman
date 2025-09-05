# Claude Code - School Management System

A comprehensive school management and decision support system built with Next.js 15, TypeScript, and MySQL.

## 🚀 Features

- **Role-based Authentication** (Super Admin, Admin, Principal, User)
- **Dashboard** with real-time KPIs and analytics
- **School Management** system
- **Task Management** with approval workflows
- **Decision Support System** with weighted criteria
- **Document Management** and file uploads
- **Reporting & Analytics** with rating system
- **Responsive Design** with shadcn/ui components

## 🛠 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** MySQL with mysql2
- **Authentication:** Custom auth with bcrypt
- **Development:** Turbopack for fast dev builds

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd app-saw-nextjs-rajiman
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/claude_code_db"
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=claude_code_db
DB_PORT=3306

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### 4. Create MySQL Database
```sql
CREATE DATABASE claude_code_db;
```

### 5. Initialize Database Tables
Run the database initialization endpoint:
```bash
curl -X POST http://localhost:3000/api/init-db
```

Or visit `http://localhost:3000/api/init-db` in your browser after starting the dev server.

### 6. Create Default Admin User
Run the migration to create the default admin user and sample data:
```bash
curl -X POST http://localhost:3000/api/migrate
```

**Default Admin Credentials:**
- **Email:** `admin@claudecode.com`
- **Password:** `password123`
- **Role:** Super Admin

### 7. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 🔐 User Roles

### Super Admin
- System-wide configuration and management
- School and principal data management
- Criteria weighting configuration for decision support
- Full system access

### Admin
- Data management and system operations
- Content approval and oversight
- User management within assigned scope
- Report generation and data export

### Kepala Sekolah (Principal)
- Strategic decision-making for the school
- Task oversight and approval
- Performance monitoring and reporting
- Comprehensive dashboard access with KPIs

### User (Staff)
- Task execution and management
- Progress reporting and documentation
- Task management system (Todo → In Progress → Done)
- Documentation upload

## 🗄 Database Schema

The system uses 7 main tables:
- **users** - User accounts and authentication
- **schools** - School information and management
- **tasks** - Main task management
- **subtasks** - Task breakdown and assignment
- **documentation** - File uploads and attachments
- **reports** - Reporting system with ratings
- **criteria** - Decision support criteria and weights

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### System
- `GET /api/test-db` - Test database connection
- `POST /api/init-db` - Initialize database tables
- `POST /api/migrate` - Create default admin user and sample data

## 📱 Application Structure

```
src/
├── app/
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Authentication pages
│   ├── register/
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── db.ts              # Database connection
│   └── utils.ts           # Utility functions
└── types/
    └── index.ts           # TypeScript types and enums
```

## 🔧 Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npx tsc --noEmit
```

## 📊 Getting Started Guide

1. **First Login:**
   - Go to `http://localhost:3000`
   - Login with admin credentials: `admin@claudecode.com` / `password123`

2. **Create Users:**
   - Navigate to `/register` to create additional users
   - Select appropriate roles for different users

3. **Setup Schools:**
   - Sample schools are created during migration
   - Add more schools via the admin interface

4. **Start Managing Tasks:**
   - Create tasks and assign them to users
   - Monitor progress through the dashboard

## 🎯 Key Features Usage

### Task Management
- Create tasks with priority levels (Low, Medium, High)
- Assign tasks to specific users
- Track progress: Todo → In Progress → Done
- Approval workflow for principals

### Decision Support
- Configure criteria weights
- Generate data-driven recommendations
- Track decision outcomes

### Reporting
- Generate comprehensive reports
- 5-star rating system with comments
- Export data for analysis

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- Role-based access control (RBAC)
- SQL injection protection
- Input validation and sanitization
- Secure session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Next.js 15 and modern web technologies**
