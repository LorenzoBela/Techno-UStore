import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);
const resolve4 = promisify(dns.resolve4);

// Debug endpoint to check database connection and data
// DELETE THIS FILE AFTER DEBUGGING
export async function GET() {
    const debugInfo: any = {
        steps: [],
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasDbUrl: !!process.env.DATABASE_URL,
        }
    };

    try {
        // 1. Parse DATABASE_URL
        debugInfo.steps.push("Parsing DATABASE_URL");
        const dbUrl = process.env.DATABASE_URL;
        let host = "";
        
        if (dbUrl) {
            try {
                const url = new URL(dbUrl);
                host = url.hostname;
                debugInfo.dbConfig = {
                    host: url.hostname,
                    port: url.port,
                    user: url.username,
                    database: url.pathname.replace('/', ''),
                    protocol: url.protocol,
                    params: Object.fromEntries(url.searchParams),
                };
            } catch (e) {
                debugInfo.dbConfig = { error: "Could not parse DATABASE_URL" };
            }
        } else {
            debugInfo.steps.push("❌ DATABASE_URL is missing");
        }

        // 2. DNS Lookup
        if (host) {
            debugInfo.steps.push(`Performing DNS lookup for ${host}`);
            try {
                const address = await lookup(host);
                debugInfo.dns = address;
                debugInfo.steps.push("✅ DNS lookup successful");
            } catch (e: any) {
                debugInfo.dns = { error: e.message, code: e.code };
                debugInfo.steps.push("❌ DNS lookup failed");
            }

            // 2b. IPv4 Specific Lookup
            debugInfo.steps.push(`Performing IPv4 specific lookup for ${host}`);
            try {
                const addresses = await resolve4(host);
                debugInfo.dnsIPv4 = addresses;
                debugInfo.steps.push("✅ IPv4 lookup successful");
            } catch (e: any) {
                debugInfo.dnsIPv4 = { error: e.message, code: e.code };
                debugInfo.steps.push("❌ IPv4 lookup failed");
            }
        }

        // 3. Test Prisma Connection
        debugInfo.steps.push("Testing Prisma connection...");
        
        // Try a simple query first
        const userCount = await prisma.user.count();
        debugInfo.counts = { users: userCount };
        debugInfo.steps.push("✅ Prisma connection successful");

        // Get more data if successful
        const productCount = await prisma.product.count();
        const categoryCount = await prisma.category.count();
        
        debugInfo.counts.products = productCount;
        debugInfo.counts.categories = categoryCount;

        return NextResponse.json({
            status: "connected",
            ...debugInfo
        });

    } catch (error: any) {
        console.error("Debug endpoint error:", error);
        
        return NextResponse.json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            ...debugInfo
        }, { status: 500 });
    }
}
