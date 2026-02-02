# Admin Dashboard Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- pnpm package manager

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/goldennumbers
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/goldennumbers

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@goldennumbers.pk
ADMIN_PASSWORD=admin123
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Seed Admin User

Run the seed script to create the initial admin user:

```bash
pnpm run seed:admin
```

This will create an admin user with:
- Email: `admin@goldennumbers.pk` (or from `ADMIN_EMAIL` env var)
- Password: `admin123` (or from `ADMIN_PASSWORD` env var)

**⚠️ Change the default password after first login!**

### 4. Start Development Server

```bash
pnpm run dev


### 5. Access Admin Dashboard

Navigate to: `http://localhost:3000/admin/login`

## Admin Dashboard Features

### Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Main dashboard with statistics
- `/admin/numbers` - Manage golden numbers (CRUD)
- `/admin/categories` - Manage categories (CRUD)
- `/admin/settings` - Settings page

### Features

#### Numbers Management
- ✅ Add new numbers
- ✅ Edit existing numbers
- ✅ Delete numbers
- ✅ Filter by status, category, search
- ✅ Set status (available, sold, reserved)
- ✅ Add tags (VIP, Platinum, etc.)
- ✅ Set network (Jazz, Ufone, Telenor, Warid, Zong)
- ✅ Mark as limited offer

#### Categories Management
- ✅ Create categories
- ✅ Edit categories
- ✅ Delete categories (with validation)
- ✅ Set status (active/inactive)
- ✅ Auto-generate slugs

#### Dashboard
- ✅ View statistics (total numbers, available, sold, categories)
- ✅ Quick overview of system status

## Security Features

- ✅ Role-based access control (Admin only)
- ✅ Protected routes with middleware
- ✅ Secure password hashing (bcrypt)
- ✅ Input validation
- ✅ Prevents deletion of categories with associated numbers
- ✅ Session management with NextAuth

## Database Schema

### Admin
- email (unique)
- password (hashed)
- role (admin)

### Number
- number (unique)
- categoryId (reference to Category)
- price
- status (available, sold, reserved)
- tags (array)
- description
- network (Jazz, Ufone, Telenor, Warid, Zong)
- limitedOffer (boolean)

### Category
- name
- slug (unique)
- status (active, inactive)

## API Endpoints

All endpoints require admin authentication:

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/numbers` - Get all numbers
- `POST /api/admin/numbers` - Create new number
- `GET /api/admin/numbers/[id]` - Get single number
- `PUT /api/admin/numbers/[id]` - Update number
- `DELETE /api/admin/numbers/[id]` - Delete number
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create new category
- `GET /api/admin/categories/[id]` - Get single category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` is correct
- Verify network access if using MongoDB Atlas

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Admin User Not Created
- Run `pnpm run seed:admin` again
- Check MongoDB connection
- Verify environment variables are set

## Production Deployment

1. Set secure environment variables
2. Use a strong `NEXTAUTH_SECRET`
3. Change default admin password
4. Enable HTTPS
5. Set up proper MongoDB connection (Atlas recommended)
6. Configure `NEXTAUTH_URL` to your production domain

