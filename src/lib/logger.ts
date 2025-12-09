import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export type LogAction =
    | "ORDER_CREATED"
    | "ORDER_UPDATED"
    | "ORDER_COMPLETED"
    | "ORDER_CANCELLED"
    | "PAYMENT_VERIFIED"
    | "PAYMENT_REJECTED"
    | "PRODUCT_CREATED"
    | "PRODUCT_UPDATED"
    | "PRODUCT_DELETED"
    | "LOGIN"
    | "LOGOUT"
    | "OTHER";

interface CreateLogParams {
    action: LogAction;
    entityId?: string;
    entityType?: "Order" | "Product" | "Payment" | "User" | "Other";
    details?: string | object;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
}

// Helper to get current admin user from server-side cookies
export async function getServerAdmin(): Promise<{ id: string; email: string; name?: string } | null> {
    try {
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // Get all cookies and find the Supabase auth token
        const allCookies = cookieStore.getAll();

        // Supabase stores auth in different cookie formats depending on the setup
        // Common patterns: sb-<project-ref>-auth-token or sb-<project-ref>-auth-token-code-verifier
        let accessToken: string | null = null;

        for (const cookie of allCookies) {
            if (cookie.name.includes('auth-token') && !cookie.name.includes('code-verifier')) {
                try {
                    // The cookie value might be a JSON string with access_token
                    const parsed = JSON.parse(cookie.value);
                    if (parsed.access_token) {
                        accessToken = parsed.access_token;
                        break;
                    }
                } catch {
                    // If it's not JSON, it might be the token directly
                    if (cookie.value && cookie.value.length > 50) {
                        accessToken = cookie.value;
                        break;
                    }
                }
            }
        }

        if (!accessToken) {
            return null;
        }

        // Use service role key to verify the token
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        });

        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email || 'unknown',
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]
        };
    } catch (error) {
        console.error("Failed to get server admin:", error);
        return null;
    }
}

export async function createSystemLog({
    action,
    entityId,
    entityType,
    details,
    userId,
    userEmail,
    ipAddress,
}: CreateLogParams) {
    try {
        const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

        // Validate userId exists in User table to avoid FK violation
        let validUserId: string | undefined = undefined;
        if (userId) {
            const userExists = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true }
            });
            if (userExists) {
                validUserId = userId;
                // Also capture email as snapshot if not provided
                if (!userEmail) {
                    userEmail = userExists.email;
                }
            }
        }

        await prisma.systemLog.create({
            data: {
                action,
                entityId,
                entityType,
                details: detailsString,
                userId: validUserId,
                userEmail,
                ipAddress,
            },
        });
    } catch (error) {
        console.error("Failed to create system log:", error);
        // Graceful failure - don't crash the app if logging fails
    }
}
