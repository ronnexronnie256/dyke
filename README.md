# Dyke Investments - Real Estate Platform

A comprehensive real estate platform for Uganda with role-based access control.

## Features

### 🏠 **For Property Sellers**
- Submit property listings through dedicated forms
- Upload property images
- Track submission status
- Contact management

### 🔍 **For Property Buyers** 
- Submit detailed buyer requests
- Specify budget, location, and requirements
- Book site visits
- Browse approved properties

### 👨‍💼 **For Administrators**
- Complete dashboard with analytics
- Property approval/rejection system
- User management
- Buyer request tracking
- Site visit management
- Real-time statistics

## User Roles & Access

### **Buyers**
- Access: Buyer request forms, property browsing, site visit booking
- No dashboard access - form-based interactions only

### **Sellers** 
- Access: Property listing forms, submission tracking
- No dashboard access - form-based interactions only

### **Admins**
- Access: Full dashboard with all management features
- Property approval system
- User role management
- Complete system oversight

## Database Options

### Option 1: Supabase (Current)
The project is currently configured for Supabase with:
- Built-in authentication
- Real-time subscriptions
- Row Level Security (RLS)
- File storage for images

### Option 2: Neon Database (Alternative)

To switch to Neon Database:

1. **Install Neon dependencies:**
```bash
npm install @neondatabase/serverless
```

2. **Environment Variables:**
```env
VITE_NEON_DATABASE_URL=your_neon_connection_string
```

3. **Database Schema:**
Create tables in your Neon database using the SQL files in `/supabase/migrations/`

4. **Update imports:**
Replace Supabase imports with Neon:
```typescript
// Replace this:
import { supabase } from './lib/supabase';

// With this:
import { neonDb, sql } from './lib/neon';
```

5. **Authentication:**
For Neon, you'll need to implement your own authentication system or use:
- Auth0
- Firebase Auth
- NextAuth.js
- Custom JWT implementation

### Neon Advantages:
- ✅ Serverless PostgreSQL
- ✅ Better performance for complex queries
- ✅ More cost-effective for high-traffic apps
- ✅ Full PostgreSQL compatibility

### Neon Considerations:
- ❌ No built-in authentication (need separate auth service)
- ❌ No real-time subscriptions (need separate solution)
- ❌ No built-in file storage (need separate service like AWS S3)

## Getting Started

1. **Clone and install:**
```bash
npm install
```

2. **Choose your database:**
   - **Supabase:** Click "Connect to Supabase" button
   - **Neon:** Set up Neon database and update environment variables

3. **Create admin account:**
   - Go to `/signup`
   - Select "Admin" role
   - Use credentials: `admin@dykeinvestments.com` / `admin123`

4. **Start development:**
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Admin/           # Admin dashboard components
│   ├── Auth/            # Authentication & protected routes
│   ├── Forms/           # Buyer/Seller forms
│   ├── Layout/          # Header, Footer
│   └── Properties/      # Property listings & cards
├── lib/
│   ├── supabase.ts      # Supabase configuration
│   └── neon.ts          # Neon database configuration
└── pages/               # Main pages (Home, About, Contact)
```

## Role-Based Access Control

The system enforces strict role-based access:

- **Public:** Homepage, property browsing, contact forms
- **Buyers:** Buyer request forms + public access
- **Sellers:** Property listing forms + public access  
- **Admins:** Full dashboard + all other access

Unauthorized access attempts are redirected with helpful guidance.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Database:** Supabase (PostgreSQL) or Neon (PostgreSQL)
- **Authentication:** Supabase Auth or custom solution
- **Forms:** React Hook Form + Yup validation
- **Icons:** Lucide React
- **Routing:** React Router DOM

## Deployment

The application can be deployed to:
- Vercel (recommended for React apps)
- Netlify
- AWS Amplify
- Any static hosting service

Make sure to set environment variables for your chosen database solution.