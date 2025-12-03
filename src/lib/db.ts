import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Environment detection
type Environment = "development" | "production" | "test";

function getEnvironment(): Environment {
    const env = process.env.NODE_ENV || "development";
    if (env === "production" || env === "test" || env === "development") {
        return env;
    }
    return "development";
}

// Get the correct DATABASE_URL based on environment
function getDatabaseUrl(): string {
    // Check for explicit environment override
    const dbEnv = process.env.DB_ENV;
    
    if (dbEnv === "production" && process.env.PROD_DATABASE_URL) {
        return process.env.PROD_DATABASE_URL;
    } else if (dbEnv === "development" && process.env.DEV_DATABASE_URL) {
        return process.env.DEV_DATABASE_URL;
    }
    
    // Fallback: Use DATABASE_URL directly (most common for Vercel)
    return process.env.DATABASE_URL || process.env.PROD_DATABASE_URL || process.env.DEV_DATABASE_URL || "";
}

// Prisma client singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    const dbEnv = process.env.DB_ENV || getEnvironment();
    const connectionString = getDatabaseUrl();
    
    // Log connection info (without exposing the full connection string)
    if (!connectionString) {
        console.error("❌ DATABASE ERROR: No database connection string found!");
        console.error("   Available env vars:", {
            hasDATABASE_URL: !!process.env.DATABASE_URL,
            hasPROD_DATABASE_URL: !!process.env.PROD_DATABASE_URL,
            hasDEV_DATABASE_URL: !!process.env.DEV_DATABASE_URL,
            DB_ENV: process.env.DB_ENV,
            NODE_ENV: process.env.NODE_ENV,
        });
    } else {
        console.log(`🗄️  Database: Connecting to ${dbEnv.toUpperCase()} environment`);
    }
    
    // Create a connection pool with SSL for production (required by Supabase)
    const isProduction = process.env.NODE_ENV === "production";
    const pool = new Pool({ 
        connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 10, // Maximum connections in pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
    globalForPrisma.pool = pool;
    
    // Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: getEnvironment() === "development" ? ["query", "error", "warn"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Utility functions for database operations
export const db = {
    client: prisma,
    environment: getEnvironment(),

    // Check which database is active
    getActiveDatabase(): string {
        return process.env.DB_ENV || getEnvironment();
    },

    // Disconnect (useful for scripts)
    async disconnect(): Promise<void> {
        await prisma.$disconnect();
    },
};

export default prisma;
