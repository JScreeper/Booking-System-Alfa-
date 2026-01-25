# Quick Start Guide

## Initial Setup (First Time Only)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your JWT secrets (database is already configured!):
# - DATABASE_URL: Already set to SQLite (file:./prisma/dev.db)
# - JWT_SECRET: Generate using: npm run generate:secrets
# - JWT_REFRESH_SECRET: Generate using: npm run generate:secrets
#
# OR manually type any random long string (at least 32 characters)

# Generate Prisma Client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# Start development server
npm run start:dev
```

Backend will run on: http://localhost:3001
API Docs: http://localhost:3001/api

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Edit .env.local:
# - NEXT_PUBLIC_API_URL: http://localhost:3001

# Start development server
npm run dev
```

Frontend will run on: http://localhost:3000

## Database Setup

**No setup needed!** 🎉

SQLite is a file-based database that works out of the box:
- No installation required
- No server to run
- Database file is created automatically at `backend/prisma/dev.db`
- Completely free and perfect for development

The database will be created automatically when you run:
```bash
npm run prisma:migrate
```

**Note:** For production with high traffic, you can later migrate to PostgreSQL if needed, but SQLite works great for small to medium applications!

## Next Steps

After setup is complete, you can start implementing:

1. ✅ Project structure - **DONE**
2. Authentication module (JWT)
3. User registration/login
4. Service CRUD operations
5. Appointment booking system
6. Admin dashboard
7. Email notifications

## Useful Commands

### Backend
- `npm run start:dev` - Development with hot reload
- `npm run prisma:studio` - Open database GUI
- `npm run prisma:migrate` - Create new migration
- `npm run build` - Build for production

### Frontend
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run lint` - Check code quality

## Troubleshooting

### Database Connection Issues
- SQLite creates the database file automatically
- Make sure the `prisma` folder exists in the backend directory
- Check that DATABASE_URL in `.env` is set to `file:./prisma/dev.db`

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Change port in `package.json` scripts

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply changes
