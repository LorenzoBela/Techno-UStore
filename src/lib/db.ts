import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Prisma client singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === "production";
    
    if (!connectionString) {
        console.error("❌ DATABASE ERROR: DATABASE_URL not found!");
        throw new Error("DATABASE_URL environment variable is not set");
    }
    
    console.log(`🗄️  Database: Connecting (${isProduction ? "production" : "development"})`);

    // Use native Prisma Client for better compatibility
    // We rely on the DATABASE_URL environment variable being set correctly.
    // This avoids issues with passing 'datasources' to the constructor in Prisma 7
    // and lets the native Rust engine handle connection pooling and IPv6 resolution.
    return new PrismaClient({
        log: isProduction ? ["error"] : ["error", "warn"],
    });

    /*
    // Create connection pool with SSL for production
    // We use the adapter-pg to avoid TypeScript errors with datasources in Prisma 7
    // and to ensure stable connection pooling.
    const pool = new Pool({ 
        connectionString,
        ssl: { rejectUnauthorized: false }, // Required for Supabase
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
    
    // Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: isProduction ? ["error"] : ["error", "warn"],
    });
    */
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Utility functions for database operations
export const db = {
    client: prisma,

    // Disconnect (useful for scripts)
    async disconnect(): Promise<void> {
        await prisma.$disconnect();
    },
};

export default prisma;
