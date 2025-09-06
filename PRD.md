# Qwen Code - School Management System

## Product Requirements Document (PRD)

### Version: 1.0

### Date: September 5, 2025

### Document Owner: Product Team

---

## 1. Executive Summary

**Qwen Code** is a comprehensive school management and decision support system designed to streamline administrative processes, facilitate strategic decision-making, and enhance task management across different organizational levels within educational institutions.

### 1.1 Product Vision

To create an integrated platform that empowers educational administrators and staff to make data-driven decisions while efficiently managing daily operations and strategic initiatives.

### 1.2 Key Objectives

- Centralize school management operations
- Enable strategic decision-making with data insights
- Streamline task management and approval workflows
- Provide comprehensive reporting and analytics
- Ensure role-based access control and security

---

## 2. User Roles & Permissions

### 2.1 Super Admin

**Primary Responsibilities:**

- System-wide configuration and management
- School and principal data management
- Criteria weighting configuration for decision support

**Key Capabilities:**

- Input and manage school information
- Assign and manage school principals (kepala sekolah)
- Configure decision criteria weights and parameters
- Full system management access
- User role assignment and permissions management

### 2.2 Admin

**Primary Responsibilities:**

- Data management and system operations
- Content approval and oversight
- Daily system administration

**Key Capabilities:**

- Data input and file upload functionality
- Approval workflows for various processes
- System configuration and maintenance
- User management within assigned scope
- Report generation and data export

### 2.3 Kepala Sekolah (Principal)

**Primary Responsibilities:**

- Strategic decision-making for the school
- Task oversight and approval
- Performance monitoring and reporting

**Key Capabilities:**

- Strategic decision selection and implementation
- Task creation and recommendation system
- Comprehensive dashboard access with KPIs
- Task approval and management oversight
- Generate and review detailed reports
- Monitor school performance metrics

### 2.4 User (Staff/Job Role)

**Primary Responsibilities:**

- Task execution and management
- Progress reporting and documentation
- Daily operational activities

**Key Capabilities:**

- Task management system (Todo → In Progress → Done)
- Subtask creation and assignment to team members
- Progress tracking and status updates
- Approval requests to principals
- Documentation upload (images, reports)
- Report creation and submission

---

## 3. Core Features & Functionality

### 3.1 User Management System

- **Authentication & Authorization:** Secure login with role-based access
- **Profile Management:** User information, contact details, role assignments
- **Permission Matrix:** Granular permissions based on user roles
- **Session Management:** Secure session handling with timeout

### 3.2 School Management

- **School Registration:** Complete school information management
- **Principal Assignment:** Link principals to specific schools
- **Organizational Structure:** Define reporting hierarchies
- **Multi-school Support:** Handle multiple educational institutions

### 3.3 Decision Support System

- **Criteria Management:** Configure weighted decision criteria
- **Strategic Options:** Present strategic choices to principals
- **Decision Analytics:** Track decision outcomes and effectiveness
- **Recommendation Engine:** Generate data-driven recommendations

### 3.4 Task Management System

- **Task Creation:** Create tasks with detailed specifications
- **Workflow Management:** Todo → In Progress → Done lifecycle
- **Approval Process:** Principal approval for critical milestones
- **Subtask Management:** Break down tasks into manageable components
- **Team Assignment:** Assign subtasks to team members
- **Progress Tracking:** Real-time progress monitoring

### 3.5 Documentation System

- **File Upload:** Multiple file format support
- **Image Management:** Documentation photos, attendance records
- **Payment Documentation:** Financial transaction records
- **Version Control:** Track document changes and history
- **Access Control:** Role-based document access

### 3.6 Reporting & Analytics

- **Dashboard:** Role-specific KPI dashboards
- **Performance Reports:** Comprehensive performance analytics
- **Progress Reports:** Task and project progress tracking
- **Custom Reports:** Configurable report generation
- **Rating System:** 5-star rating system with comments

---

## 4. Database Schema

### 4.1 Core Tables

#### Users Table

```sql
- user_id (Primary Key)
- name
- email
- password (hashed)
- role (super_admin, admin, kepala_sekolah, user)
- school_id (Foreign Key)
- created_at
- updated_at
- is_active
```

#### Schools Table

```sql
- sekolah_id (Primary Key)
- nama_sekolah
- alamat
- kontak
- kepala_sekolah_id (Foreign Key to Users)
- created_at
- updated_at
```

#### Tasks Table

```sql
- task_id (Primary Key)
- title
- description
- assigned_to (Foreign Key to Users)
- created_by (Foreign Key to Users)
- status (todo, in_progress, done)
- priority (low, medium, high)
- due_date
- approval_status
- approved_by_user_id (Foreign Key to Users)
- approval_date
- created_at
- updated_at
```

#### Subtasks Table

```sql
- subtask_id (Primary Key)
- relation_task_id (Foreign Key to Tasks)
- subtask_title
- subtask_description
- assigned_to (Foreign Key to Users)
- subtask_status
- subtask_comment
- subtask_date
- created_at
- updated_at
```

#### Documentation Table

```sql
- doc_id (Primary Key)
- subtask_id (Foreign Key)
- doc_type (documentation, payment, attendance)
- file_path
- file_name
- uploaded_by (Foreign Key to Users)
- uploaded_at
```

#### Reports Table

```sql
- report_id (Primary Key)
- task_id (Foreign Key)
- created_by (Foreign Key to Users)
- report_data (JSON)
- rating (1-5)
- comment
- created_at
- updated_at
```

#### Criteria Table

```sql
- criteria_id (Primary Key)
- criteria_name
- weight
- description
- created_by (Foreign Key to Users)
- is_active
```

---

## 5. Technical Specifications

### 5.1 Technology Stack

#### Backend

- **Framework:** Next.js 15 with App Router
- **Database:** MySQL (primary)
- **Authentication:** NextAuth.js with JWT
- **File Storage:** Local storage with cloud backup option
- **API:** Next.js API Routes (RESTful design)

#### Frontend

- **Framework:** Next.js 15 with React 19
- **State Management:** React Context API with Server Components
- **UI Components:** shadcn/ui with Tailwind CSS
- **Responsive Design:** Mobile-first approach
- **Charts/Analytics:** Recharts or Chart.js

#### DevOps & Infrastructure

- **Development:** Turbopack for fast development
- **Version Control:** Git
- **Database Connection:** mysql2 with connection pooling
- **Environment Management:** .env configuration
- **API Documentation:** Built-in Next.js API documentation

### 5.2 System Requirements

- **Responsive Design:** Compatible with desktop, tablet, and mobile devices
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest versions)
- **Performance:** Page load time < 2 seconds with Turbopack
- **Scalability:** Support for multiple schools and concurrent users
- **Security:** HTTPS, data encryption, role-based access control

---

## 6. User Experience (UX) Requirements

### 6.1 Design Principles

- **Intuitive Navigation:** Clear menu structure and breadcrumbs
- **Consistent Interface:** Uniform design patterns using shadcn/ui
- **Accessibility:** WCAG 2.1 AA compliance
- **Mobile Responsiveness:** Optimized for all screen sizes
- **Performance:** Fast loading with React Server Components

### 6.2 Key User Journeys

#### Super Admin Journey

1. Login → System Dashboard
2. School Management → Add/Edit Schools
3. User Management → Assign Roles
4. Criteria Configuration → Set Weights

#### Principal Journey

1. Login → Principal Dashboard
2. Strategic Decisions → Review Options
3. Task Approval → Review Submissions
4. Reports → Generate Analytics

#### Staff/User Journey

1. Login → Personal Dashboard
2. Task Management → Update Progress
3. Documentation → Upload Files
4. Report Submission → Complete Tasks

---

## 7. Security Requirements

### 7.1 Authentication & Authorization

- NextAuth.js for secure authentication
- Role-based access control (RBAC)
- Session timeout and management
- Password complexity requirements

### 7.2 Data Security

- Data encryption at rest and in transit
- Regular security audits
- SQL injection and XSS protection
- Secure file upload validation
- CSRF protection with Next.js built-ins

---

## 8. Performance Requirements

### 8.1 System Performance

- **Response Time:** < 1 second for most operations with Turbopack
- **Concurrent Users:** Support for 1000+ simultaneous users
- **Database Performance:** Optimized queries with mysql2
- **File Upload:** Support for files up to 50MB
- **Static Generation:** ISR for better performance

### 8.2 Scalability

- Next.js optimized for scalability
- Database connection pooling
- Image optimization with Next.js Image component
- Edge runtime support where applicable

---

## 9. Integration Requirements

### 9.1 External Integrations

- Email notification system (Nodemailer)
- File storage services integration ready
- Analytics platforms (Vercel Analytics)
- Database backup services

### 9.2 API Requirements

- **Next.js API Routes:** RESTful endpoints using /api directory structure
- **API rate limiting:** Built-in middleware for request limiting
- **Real-time updates:** Server-Sent Events integration
- **File Upload API:** Multipart form handling in API routes
- **Type Safety:** Full TypeScript integration

---

## 10. Testing Requirements

### 10.1 Testing Strategy

- **Unit Testing:** Jest and React Testing Library
- **Integration Testing:** API and database testing
- **User Acceptance Testing:** Role-based testing scenarios
- **Performance Testing:** Load testing with Next.js
- **Type Safety:** TypeScript strict mode

---

## 11. Deployment & Maintenance

### 11.1 Deployment Strategy

- **Vercel:** Recommended for Next.js applications
- **Environment Setup:** Development, Staging, Production
- **Database:** MySQL on cloud (PlanetScale, AWS RDS)
- **CI/CD:** Built-in Vercel deployment pipeline

### 11.2 Maintenance Plan

- Regular security updates
- Performance monitoring with Vercel Analytics
- User feedback collection
- Feature updates with Next.js releases
- Documentation maintenance

---

## 12. Success Metrics

### 12.1 Key Performance Indicators (KPIs)

- **User Adoption:** 90% active user rate within 3 months
- **System Uptime:** 99.9% availability
- **Task Completion Rate:** 85% tasks completed on time
- **User Satisfaction:** 4.5+ rating in feedback surveys
- **Performance:** < 1 second average page load time

---

## 13. Timeline & Milestones

### Phase 1 (Months 1-2): Core System Development

- User authentication with NextAuth.js
- Basic CRUD operations with API routes
- Database setup with MySQL and core tables

### Phase 2 (Months 3-4): Feature Development

- Task management system
- Documentation upload functionality
- Basic reporting with charts

### Phase 3 (Months 5-6): Advanced Features

- Decision support system
- Advanced analytics dashboards
- Mobile responsiveness optimization

### Phase 4 (Months 7-8): Testing & Deployment

- Comprehensive testing
- Security audits
- Production deployment

---

## 14. Risk Assessment

### 14.1 Technical Risks

- **Database Performance:** MySQL optimization and indexing
- **Security Vulnerabilities:** NextAuth.js and Next.js security features
- **Scalability Issues:** Next.js built-in performance optimizations

### 14.2 Business Risks

- **User Adoption:** Comprehensive training program
- **Data Migration:** Thorough testing with MySQL
- **Integration Challenges:** Well-documented API routes

---

## 15. Conclusion

Qwen Code represents a comprehensive solution for modern educational institution management built on Next.js 15, combining strategic decision-making capabilities with efficient operational task management. The system leverages the latest Next.js features including App Router, Server Components, and Turbopack for optimal performance.

The technical implementation using Next.js 15, MySQL, and shadcn/ui ensures scalability, maintainability, and excellent developer experience. The responsive design approach guarantees accessibility across all device types, making it suitable for the diverse technological landscape of educational institutions.

Success will be measured through user adoption rates, system performance metrics, and tangible improvements in administrative efficiency and strategic decision-making capabilities within participating schools.
