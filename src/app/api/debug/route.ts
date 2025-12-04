import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Debug endpoint to check database connection and data
// DELETE THIS FILE AFTER DEBUGGING
export async function GET() {
    try {
        // Parse DATABASE_URL to return safe details
        const dbUrl = process.env.DATABASE_URL;
        let dbConfig = {};
        if (dbUrl) {
            try {
                const url = new URL(dbUrl);
                dbConfig = {
                    host: url.hostname,
                    port: url.port,
                    user: url.username,
                    database: url.pathname.replace('/', ''),
                    protocol: url.protocol,
                    // Do not return password!
                };
            } catch (e) {
                dbConfig = { error: "Could not parse DATABASE_URL" };
            }
        }

        // Test database connection
        const productCount = await prisma.product.count();
        const categoryCount = await prisma.category.count();
        const userCount = await prisma.user.count();
        
        // Get sample products
        const products = await prisma.product.findMany({
            take: 3,
            include: {
                category: true,
                images: true,
            },
        });

        // Get categories
        const categories = await prisma.category.findMany();

        return NextResponse.json({
            status: "connected",
            dbConfig,
            counts: {
                products: productCount,
                categories: categoryCount,
                users: userCount,
            },
            sampleProducts: products.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category.name,
                imageCount: p.images.length,
            })),
            categories: categories.map(c => ({
                name: c.name,
                slug: c.slug,
            })),
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV,
            },
        });
    } catch (error: any) {
        console.error("Debug endpoint error:", error);
        
        // Parse DATABASE_URL even in error case
        const dbUrl = process.env.DATABASE_URL;
        let dbConfig = {};
        if (dbUrl) {
            try {
                const url = new URL(dbUrl);
                dbConfig = {
                    host: url.hostname,
                    port: url.port,
                    user: url.username,
                    database: url.pathname.replace('/', ''),
                    protocol: url.protocol,
                };
            } catch (e) {
                dbConfig = { error: "Could not parse DATABASE_URL" };
            }
        }

        return NextResponse.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            dbConfig,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV,
            },
        }, { status: 500 });
    }
}
