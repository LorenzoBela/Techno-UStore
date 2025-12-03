/**
 * Database Switch Helper Script
 * 
 * Quickly check or switch between development and production databases.
 * 
 * Usage:
 *   npx tsx scripts/db-switch.ts status     # Check current DB
 *   npx tsx scripts/db-switch.ts dev        # Switch to dev
 *   npx tsx scripts/db-switch.ts prod       # Switch to prod
 */

import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const command = args[0] || "status";

interface DbConfig {
    name: string;
    url: string | undefined;
    supabaseUrl: string | undefined;
}

const configs: Record<string, DbConfig> = {
    development: {
        name: "Development",
        url: process.env.DEV_DATABASE_URL,
        supabaseUrl: process.env.DEV_SUPABASE_URL,
    },
    production: {
        name: "Production",
        url: process.env.PROD_DATABASE_URL,
        supabaseUrl: process.env.PROD_SUPABASE_URL,
    },
};

async function checkConnection(envName: string): Promise<boolean> {
    const config = configs[envName];
    if (!config?.url) {
        console.log(`  ❌ ${config?.name || envName}: Not configured`);
        return false;
    }

    // Set DATABASE_URL for Prisma 7.x (reads from env directly)
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;

    const prisma = new PrismaClient();

    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log(`  ✅ ${config.name}: Connected`);
        if (config.supabaseUrl) {
            console.log(`     Supabase: ${config.supabaseUrl}`);
        }
        return true;
    } catch (error) {
        console.log(`  ❌ ${config.name}: Connection failed`);
        return false;
    } finally {
        await prisma.$disconnect();
        process.env.DATABASE_URL = originalUrl; // Restore original
    }
}

async function main() {
    console.log("\n🗄️  Techno UStore - Database Configuration\n");
    console.log("═".repeat(50));

    const currentEnv = process.env.DB_ENV || process.env.NODE_ENV || "development";
    console.log(`\n📍 Current Environment: ${currentEnv.toUpperCase()}\n`);

    switch (command) {
        case "status":
            console.log("Checking database connections...\n");
            await checkConnection("development");
            await checkConnection("production");
            break;

        case "dev":
            console.log("To switch to DEVELOPMENT database:\n");
            console.log("  Windows PowerShell:");
            console.log('    $env:DB_ENV="development"; npm run dev\n');
            console.log("  Windows CMD:");
            console.log("    set DB_ENV=development && npm run dev\n");
            console.log("  Linux/Mac:");
            console.log("    DB_ENV=development npm run dev\n");
            break;

        case "prod":
            console.log("⚠️  WARNING: Switching to PRODUCTION database!\n");
            console.log("  Windows PowerShell:");
            console.log('    $env:DB_ENV="production"; npm run dev\n');
            console.log("  Windows CMD:");
            console.log("    set DB_ENV=production && npm run dev\n");
            console.log("  Linux/Mac:");
            console.log("    DB_ENV=production npm run dev\n");
            console.log("  Or use the npm script:");
            console.log("    npm run dev:prod-db\n");
            break;

        default:
            console.log("Unknown command. Use: status, dev, or prod");
    }

    console.log("\n" + "═".repeat(50));
    console.log("\n📚 Available npm scripts:");
    console.log("   npm run db:studio       - Open Prisma Studio (dev)");
    console.log("   npm run db:studio:prod  - Open Prisma Studio (prod)");
    console.log("   npm run db:push         - Push schema to dev DB");
    console.log("   npm run db:push:prod    - Push schema to prod DB");
    console.log("   npm run db:seed         - Seed dev database");
    console.log("   npm run db:seed:prod    - Seed prod database\n");
}

main().catch(console.error);
