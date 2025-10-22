# L-Equipe Construction Management Setup

## Prerequisites

1. Node.js (v18 or higher)
2. A Supabase account and project

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `db.md` into the SQL Editor
4. Run the SQL script to create all tables and relationships

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

### Authentication System
- ✅ User registration with automatic profile creation
- ✅ User login/logout functionality
- ✅ Protected routes with authentication guards
- ✅ Role-based access control (client role by default)

### Dynamic Dashboard
- ✅ Real-time data fetching from Supabase
- ✅ Project management with milestone tracking
- ✅ Daily reports submission and viewing
- ✅ Issue tracking and task management
- ✅ User-specific data filtering

### Database Integration
- ✅ All components now fetch data dynamically from the database
- ✅ Real-time updates when data changes
- ✅ Proper error handling and loading states

## User Flow

1. **First Visit**: Users see the landing page with sign-in/sign-up options
2. **Registration**: New users can sign up and are automatically assigned the "client" role
3. **Login**: Existing users can sign in and are redirected to the dashboard
4. **Dashboard**: Authenticated users see their personalized dashboard with:
   - Project overview and milestones
   - Daily reports submission
   - Task management
   - Recent activity

## Database Schema

The application uses the following main tables:
- `profiles` - User information and roles
- `projects` - Construction projects
- `project_members` - User-project relationships
- `milestones` - Project milestones and progress
- `daily_reports` - Daily construction reports
- `issues` - Project issues and tasks
- `documents` - Project documents and files

## Next Steps

To complete the application, you may want to add:
- Document upload functionality
- Team member management
- Advanced reporting features
- Mobile responsiveness improvements
- Real-time notifications
