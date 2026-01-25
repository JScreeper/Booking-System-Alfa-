# Booking System

A full-stack booking system for small businesses (salons, clinics, coaches) built with Next.js, NestJS, SQLite, and Prisma.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (React) with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **NestJS** (Node.js framework)
- **TypeScript**
- **SQLite** database (file-based, free, no setup required!)
- **Prisma ORM** for database management
- **JWT** authentication (access + refresh tokens)
- **Swagger** API documentation
- **Class Validator** for input validation

## 📁 Project Structure

```
booking system/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── ...
├── backend/          # NestJS backend application
│   ├── src/         # Source code
│   ├── prisma/      # Prisma schema and migrations
│   └── ...
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- **No database installation needed!** (SQLite is file-based)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your JWT secrets (database is already configured):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Start the development server:
```bash
npm run start:dev
```

The backend will be available at `http://localhost:3001`
Swagger documentation will be available at `http://localhost:3001/api`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📋 Core Features (To Be Implemented)

- ✅ Project structure and initial setup
- ⏳ User registration and login
- ⏳ Role-based access control (admin, user)
- ⏳ Service management (CRUD operations)
- ⏳ Business availability & working hours
- ⏳ Appointment booking with time slots
- ⏳ Prevent double bookings
- ⏳ User booking history
- ⏳ Admin dashboard
- ⏳ Email notifications
- ⏳ Fully responsive UI

## 🔒 Security Features (To Be Implemented)

- ⏳ Protected routes
- ⏳ Input validation
- ⏳ Centralized error handling
- ⏳ Rate limiting

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm run build`
4. Configure start command: `npm run start:prod`

### Database
- SQLite is file-based and works out of the box!
- The database file will be created automatically at `backend/prisma/dev.db`
- For production, you can still use SQLite or migrate to PostgreSQL if needed

## 📝 API Documentation

Once the backend is running, visit `http://localhost:3001/api` to view the Swagger API documentation.

## 🧪 Development

### Backend Commands
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:migrate` - Run database migrations

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For questions or issues, please contact the project maintainer.
