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
    const env = getEnvironment();
    const dbEnv = process.env.DB_ENV || env;

    if (dbEnv === "production" && process.env.PROD_DATABASE_URL) {
        return process.env.PROD_DATABASE_URL;
    } else if (process.env.DEV_DATABASE_URL) {
        return process.env.DEV_DATABASE_URL;
    }
    return process.env.DATABASE_URL || "";
}

// Prisma client singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    const dbEnv = process.env.DB_ENV || getEnvironment();
    console.log(`🗄️  Database: Connecting to ${dbEnv.toUpperCase()} environment`);

    const connectionString = getDatabaseUrl();
    
    // Create a connection pool
    const pool = new Pool({ connectionString });
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
