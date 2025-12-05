import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Prisma client singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: pg.Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    // Use pooled connection URL for serverless (Supabase Supavisor)
    // This is critical for Vercel - use the pooler URL, not direct connection
    const connectionString = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === "production";
    
    if (!connectionString) {
        console.error("❌ DATABASE ERROR: DATABASE_URL not found!");
        throw new Error("DATABASE_URL environment variable is not set");
    }
    
    if (!isProduction) {
        console.log(`🗄️  Database: Connecting (development mode)`);
    }

    // Optimized pool settings for Vercel serverless + Supabase
    // IMPORTANT: Use Supabase's connection pooler URL (port 6543) for production
    const pool = globalForPrisma.pool ?? new Pool({ 
        connectionString,
        ssl: { rejectUnauthorized: false }, // Required for Supabase
        
        // Serverless-optimized settings:
        max: isProduction ? 3 : 10, // Very few connections per instance (Vercel spawns many)
        min: 0, // Allow pool to be completely empty
        idleTimeoutMillis: 10000, // Close idle connections after 10s
        connectionTimeoutMillis: 10000, // 10s timeout to get a connection
        allowExitOnIdle: true, // Allow process to exit if pool is idle
        
        // Statement timeout to prevent long-running queries from blocking
        statement_timeout: 30000, // 30 second max query time
    });
    
    // Cache pool in development to prevent connection leaks during HMR
    if (!isProduction) {
        globalForPrisma.pool = pool;
    }
    
    // Create the Prisma adapter
    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: isProduction ? ["error"] : ["error", "warn"],
    });
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
