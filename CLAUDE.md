# Claude Code Reference

## Project: Next.js 15 Dashboard with MySQL

### Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Development Setup
- Next.js 15 with App Router
- TypeScript enabled
- Tailwind CSS for styling
- shadcn/ui for components
- MySQL database integration
- Turbopack for faster development

### Database
- MySQL connection using mysql2 and @types/mysql2
- Connection configuration in environment variables
- Database utilities in `/src/lib/db.ts`

### Architecture
- App Router structure in `/src/app`
- Components in `/src/components`
- Database utilities in `/src/lib`
- Types in `/src/types`