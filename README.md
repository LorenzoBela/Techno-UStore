# Techno UStore

A modern, full-featured e-commerce platform designed for university merchandise. Techno UStore provides a seamless shopping experience for students and a powerful dashboard for administrators to manage products, orders, and inventory.

---

## 🚀 Overview

Techno UStore is built with the latest web technologies to ensure performance, scalability, and a premium user experience. It features a responsive design, real-time inventory tracking, and a streamlined pickup-based checkout system tailored for campus environments.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (React 19, App Router) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Tables** | [TanStack Table](https://tanstack.com/table/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Authentication** | Supabase Auth (Google OAuth) |
| **Storage** | Supabase Storage (for payment proofs and product images) |

---

## ✨ Features

### 🛒 Customer Experience
- **Product Browsing**: Filter by Category (**Apparel, Accessories, Supplies, Uniforms**), Subcategory, Price, and more.
- **Rich Product Details**: View multiple product images with zoom modal, select variants (Size/Color), and check stock availability.
- **Smart Cart & Wishlist**: Persistent cart state and wishlist management via React Context.
- **Store Pickup Checkout**: Streamlined checkout process focused on on-campus pickup. Supports "Guest" checkout.
- **GCash Payment**: Upload GCash payment proofs for manual admin verification.
- **Order Tracking**: Detailed status timeline: `Pending` → `Under Review` → `Ready for Pickup` → `Completed`.
- **User Profile**: Manage contact info (Philippine phone validation) and view detailed order history with status filters.

### 👨‍💻 Admin Dashboard
The admin dashboard is a powerhouse for store management, optimized for performance with caching strategies.

#### **Analytics & Reporting**
- **Real-time Overview**: Instant access to Revenue, Order Count, and Active Users.
- **Performance Optimization**: Dashboard stats are cached (`unstable_cache`) for 60 seconds to reduce database load.
- **Sales Charts**: Interactive bar charts (Recharts) visualizing monthly revenue over the last 12 months.
- **Top Products**: Algorithmically determines top-selling items using optimized aggregation queries with batch fetching (avoids N+1 queries).

#### **Pickup Calendar Heatmap**
Visualizes order volume to help staff prepare for peak pickup days:
- 🟢 **Low Load**: 1-3 orders (Green)
- 🟡 **Medium Load**: 4-9 orders (Yellow)
- 🔴 **High Load**: 10+ orders (Red)
- **Interactive**: Click any day to see a detailed list of customers and items scheduled for pickup.
- **Responsive**: Separate mobile view with a list-based layout.

#### **Order Management System**
- **Payment Verification Flow**:
  1. **View Proof**: Admin reviews the uploaded GCash screenshot via a modal.
  2. **Accept & Schedule**: Admin approves payment and sets a **Pickup Date**.
  3. **Reject**: Admin rejects invalid proofs with a custom reason sent to the user.
- **Status Control**: Manually override statuses (`Pending`, `Cancelled`, `Completed`).
- **One-Click Completion**: "Mark as Picked Up" button immediately completes orders and updates inventory logs.
- **Optimistic Locking**: A `version` field on orders prevents concurrent admin conflicts.

#### **Inventory & Products**
- **Variant Management**: Complex support for Size/Color variants with individual stock tracking per variant.
- **Image Gallery**: Upload multiple product images to Supabase Storage.
- **Featured Products**: Mark products as "Featured" to display on the homepage carousel.

#### **System Logging**
A comprehensive audit trail for all critical actions, tracked in the `SystemLog` table. Logged actions include:
- `ORDER_CREATED`, `ORDER_UPDATED`, `ORDER_COMPLETED`, `ORDER_CANCELLED`
- `PAYMENT_VERIFIED`, `PAYMENT_REJECTED`
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`
- `LOGIN`, `LOGOUT`

Each log entry captures the action, affected entity, details, admin user, and email snapshot.

---

## 🗂️ Database Schema

The Prisma schema defines the following key models:

| Model | Description |
|-------|-------------|
| `User` | Stores user info, role (`user`/`admin`), and relations to orders, cart, and wishlist. |
| `Category` | Product categories (Apparel, Accessories, etc.) with display order and activation status. |
| `Subcategory` | Child categories for more granular filtering. |
| `Product` | Product details including price, stock, and featured flag. Related to images and variants. |
| `ProductVariant` | Size/Color variants with individual stock tracking. |
| `ProductImage` | Multiple images per product stored via Supabase Storage. |
| `Order` | Customer orders with status workflow and pickup scheduling. |
| `Payment` | GCash payment tracking with proof URL and verification status. |
| `Cart` / `CartItem` | Persistent user carts. |
| `Wishlist` / `WishlistItem` | User wishlists with product snapshots. |
| `SystemLog` | Audit trail for admin actions. |
| `InventoryLog` | Tracks stock changes over time. |
| `Settings` | Key-value store for app configurations. |

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- A Supabase project (for PostgreSQL, Auth, and Storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Techno UStore"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database (Prisma)
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
   DEV_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"  # For dev
   PROD_DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" # For prod
   
   # Supabase Auth & Storage
   NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]" # For server-side admin operations
   ```

4. **Database Setup**
   Push the schema to your Supabase database and seed initial data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
   *Note: `db:seed` populates default categories (Apparel, Accessories, etc.) and sample products.*

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## � Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server on `localhost:3000`. |
| `npm run dev:prod-db` | Starts dev server connected to the production database. |
| `npm run build` | Builds the application for production. |
| `npm run start` | Starts the production server. |
| `npm run lint` | Runs ESLint to check for code issues. |
| `npm run db:generate` | Generates the Prisma Client. |
| `npm run db:push` | Pushes the Prisma schema to the database (dev). |
| `npm run db:push:prod` | Pushes the Prisma schema to the production database. |
| `npm run db:studio` | Opens Prisma Studio for database inspection. |
| `npm run db:studio:prod` | Opens Prisma Studio for the production database. |
| `npm run db:migrate:dev` | Creates and applies a new migration (dev). |
| `npm run db:migrate:prod` | Deploys pending migrations to production. |
| `npm run db:seed` | Seeds the database with initial data. |
| `npm run db:seed:prod` | Seeds the production database. |

---

## 📂 Project Structure

```
Techno UStore/
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Database seeding script
├── public/                  # Static assets (images, icons)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Protected admin dashboard routes
│   │   ├── api/             # API routes (auth, products, debug)
│   │   ├── cart/            # Shopping cart page
│   │   ├── checkout/        # Checkout flow
│   │   ├── product/         # Product details pages
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   └── ...              # Other customer-facing pages
│   ├── components/
│   │   ├── admin/           # Admin-specific widgets (PickupCalendar, Reports)
│   │   ├── home/            # Homepage components (Hero, ProductCarousel)
│   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   ├── product/         # Product display components
│   │   └── ui/              # Base UI components (Button, Dialog, Input)
│   └── lib/
│       ├── auth-context.tsx # Client-side authentication state
│       ├── cart-context.tsx # Persistent cart state management
│       ├── wishlist-context.tsx # Wishlist state management
│       ├── db.ts            # Global Prisma client instance
│       ├── logger.ts        # System logging utility
│       ├── products.ts      # Product fetching utilities
│       └── supabase.ts      # Supabase client configuration
├── next.config.ts           # Next.js configuration (image optimization, caching)
├── package.json
└── README.md
```

---

## ⚙️ Configuration & Optimization

### Image Optimization
The project uses Next.js Image Optimization with:
- **AVIF & WebP** formats for superior compression.
- **1-year cache TTL** for optimized images.
- **Supabase Storage** integration for remote images.

### Caching Headers
Static assets and Next.js static files are served with `Cache-Control: public, max-age=31536000, immutable` for aggressive caching.

### Server Actions
File uploads (payment proofs) are handled via Server Actions with a body size limit of **10MB**.

---

## 🔒 Security & Roles

- **Authentication**: Powered by **Supabase Auth** (Google OAuth).
- **Role-Based Access Control (RBAC)**:
  - Users are `user` by default.
  - **Admin Access**: Protected via Database Role checks in server actions and components.
  - **To Make an Admin**:
    1. User signs up via UI and logs in once.
    2. Database admin manually updates `User.role` to `'admin'` via Prisma Studio or SQL:
       ```sql
       UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
       ```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/).
3. Add all environment variables.
4. Deploy!

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit: `git commit -m "Add your feature"`.
4. Push to your fork: `git push origin feature/your-feature`.
5. Open a Pull Request.

---

## 📝 License

This project is developed for **Adamson University** as the official university store platform.

---

Developed with ❤️ for **Adamson University** - *Techno UStore*
