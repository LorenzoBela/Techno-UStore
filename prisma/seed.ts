/**
 * Database Seed Script
 * 
 * Populates the database with initial data.
 * 
 * Usage:
 *   npm run db:seed        # Seeds development database
 *   npm run db:seed:prod   # Seeds production database (be careful!)
 */

import { PrismaClient } from "@prisma/client";

// Determine which database to connect to
const env = process.env.DB_ENV || process.env.NODE_ENV || "development";

// Set DATABASE_URL based on environment (Prisma 7.x reads from env directly)
if (env === "production" && process.env.PROD_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL;
} else if (process.env.DEV_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DEV_DATABASE_URL;
}

console.log(`🌱 Seeding ${env.toUpperCase()} database...`);

const prisma = new PrismaClient();

async function main() {
    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: "apparel" },
            update: {},
            create: {
                name: "Apparel",
                slug: "apparel",
                description: "University clothing and merchandise",
            },
        }),
        prisma.category.upsert({
            where: { slug: "accessories" },
            update: {},
            create: {
                name: "Accessories",
                slug: "accessories",
                description: "Bags, caps, lanyards and more",
            },
        }),
        prisma.category.upsert({
            where: { slug: "supplies" },
            update: {},
            create: {
                name: "Supplies",
                slug: "supplies",
                description: "School and office supplies",
            },
        }),
        prisma.category.upsert({
            where: { slug: "uniforms" },
            update: {},
            create: {
                name: "Uniforms",
                slug: "uniforms",
                description: "Official university uniforms",
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    const apparel = categories.find(c => c.slug === "apparel")!;
    const accessories = categories.find(c => c.slug === "accessories")!;

    const products = await Promise.all([
        prisma.product.upsert({
            where: { slug: "adamson-hoodie-2024" },
            update: {},
            create: {
                name: "Adamson Hoodie 2024",
                slug: "adamson-hoodie-2024",
                description: "Premium quality university hoodie for 2024",
                price: 850,
                stock: 50,
                categoryId: apparel.id,
                variants: {
                    create: [
                        { size: "S", stock: 10 },
                        { size: "M", stock: 20 },
                        { size: "L", stock: 15 },
                        { size: "XL", stock: 5 },
                    ],
                },
            },
        }),
        prisma.product.upsert({
            where: { slug: "university-lanyard" },
            update: {},
            create: {
                name: "University Lanyard",
                slug: "university-lanyard",
                description: "Official university lanyard with ID holder",
                price: 150,
                stock: 200,
                categoryId: accessories.id,
            },
        }),
    ]);

    console.log(`✅ Created ${products.length} sample products`);

    // Note: Admin users should be created via Supabase Auth
    // The user will be synced to this database when they first log in
    // To create an admin:
    // 1. Create user in Supabase Auth dashboard or via sign-up
    // 2. Update their role to "admin" in this database
    if (env !== "production") {
        console.log(`ℹ️  To create an admin user:`);
        console.log(`   1. Sign up via the app or Supabase Auth dashboard`);
        console.log(`   2. Run: UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com'`);
    }

    console.log(`\n🎉 Seeding complete for ${env.toUpperCase()} database!`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
