# Techno UStore - Setup & Installation Guide

This document provides comprehensive instructions for setting up and running the Techno UStore platform locally.

---

## 📋 Table of Contents

- [Hardware Requirements](#-hardware-requirements)
- [Software Requirements](#-software-requirements)
- [Environment Setup](#-environment-setup)
- [Installation Steps](#-installation-steps)
- [Running the Application](#-running-the-application)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)

---

## 🖥️ Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | Dual-core 2.0 GHz | Quad-core 3.0 GHz+ |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 2 GB free space | 5 GB+ SSD |
| **Network** | Stable internet connection | Broadband (for Supabase cloud services) |

> [!NOTE]
> The application relies on cloud services (Supabase for database, auth, and storage), so a stable internet connection is required for full functionality.

---

## 🔧 Software Requirements

### Required Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | v20.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | v10.x or higher | Package manager (comes with Node.js) | Included with Node.js |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Optional Software

| Software | Purpose |
|----------|---------|
| **VS Code** | Recommended code editor with TypeScript support |
| **Prisma VS Code Extension** | Syntax highlighting for `.prisma` files |
| **PostgreSQL Client** | For direct database access (TablePlus, DBeaver, pgAdmin) |

### Cloud Services Required

| Service | Purpose | Account Required |
|---------|---------|------------------|
| **Supabase** | PostgreSQL database, authentication (Google OAuth), and file storage | ✅ Free tier available |

---

## 🌐 Environment Setup

### 1. Supabase Project Setup

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com/) and sign up
   - Create a new project

2. **Retrieve Your Credentials**
   - Navigate to **Settings** → **API**
   - Copy the following values:
     - `Project URL` (e.g., `https://xxxxx.supabase.co`)
     - `anon public` key
     - `service_role` key (keep this secret!)
   - Navigate to **Settings** → **Database**
   - Copy the **Connection String** (URI format)

3. **Configure Authentication**
   - Go to **Authentication** → **Providers**
   - Enable **Google** OAuth and configure with your Google Cloud credentials
   - Set up redirect URLs to include `http://localhost:3000`

4. **Create Storage Buckets**
   - Go to **Storage** → **New bucket**
   - Create the following buckets:
     - `product-images` (public access)
     - `payment-proofs` (private access)

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# =================================
# DATABASE CONFIGURATION
# =================================
# Main database URL (used by Prisma)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Development database (optional - for separate dev environment)
DEV_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# Production database
PROD_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# =================================
# SUPABASE CONFIGURATION
# =================================
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"

# Supabase anonymous key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase service role key (server-side only - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> [!CAUTION]
> Never commit your `.env` file to version control. The `.gitignore` file should already exclude it.

---

## 📦 Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Techno UStore"
```

### Step 2: Install Dependencies

```bash
npm install
```

This command will:
- Install all Node.js packages from `package.json`
- Automatically run `prisma generate` (via `postinstall` script)

### Step 3: Generate Prisma Client

If the Prisma client wasn't generated during install:

```bash
npm run db:generate
```

### Step 4: Push Database Schema

Push the Prisma schema to your Supabase database:

```bash
npm run db:push
```

### Step 5: Seed the Database (Optional)

Populate the database with initial data (categories, sample products):

```bash
npm run db:seed
```

---

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### Development with Production Database

To test against the production database locally:

```bash
npm run dev:prod-db
```

> [!WARNING]
> Be careful when using production data locally. Any changes will affect the live database.

### Production Mode

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm run start
   ```

---

## 🗄️ Database Management

### View/Edit Data with Prisma Studio

Open a visual database editor:

```bash
npm run db:studio        # For development database
npm run db:studio:prod   # For production database
```

### Create a Migration

When you modify the Prisma schema:

```bash
npm run db:migrate:dev
```

### Deploy Migrations to Production

```bash
npm run db:migrate:prod
```

### Schema Push (No Migration History)

For quick schema updates (development only):

```bash
npm run db:push
npm run db:push:prod   # For production
```

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] Database connection works (no connection errors in console)
- [ ] Products display on the homepage
- [ ] Login/signup with Google OAuth works
- [ ] Image uploads work (product images, payment proofs)
- [ ] Admin dashboard accessible at `/admin` (requires admin role)

---

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Prisma Client not found** | Run `npm run db:generate` |
| **Database connection refused** | Check `DATABASE_URL` in `.env` and verify Supabase project is active |
| **OAuth redirect error** | Ensure `http://localhost:3000` is added to Supabase Auth redirect URLs |
| **Images not loading** | Check Supabase Storage bucket policies (product-images should be public) |
| **"Cannot find module" errors** | Delete `node_modules` and run `npm install` again |
| **Port 3000 already in use** | Kill the process using port 3000 or run `npx next dev -p 3001` |

### Reset Everything

If you need a fresh start:

```bash
# Remove dependencies and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Regenerate Prisma client
npm run db:generate

# Push schema and reseed
npm run db:push
npm run db:seed
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

