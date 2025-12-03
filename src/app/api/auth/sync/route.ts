import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

// This endpoint syncs a user from Supabase Auth to the database
// Call this after successful sign-in/sign-up
export async function POST(request: NextRequest) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Verify the token with Supabase
        const supabase = getSupabaseAdmin();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // First, check if a user with this email already exists (from a different auth method)
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        let dbUser;

        if (existingUserByEmail && existingUserByEmail.id !== user.id) {
            // User exists with different ID - update the ID to match Supabase Auth
            // This handles cases where user signed up with email/password, then uses Google OAuth
            await prisma.user.delete({ where: { id: existingUserByEmail.id } });
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name || user.user_metadata?.full_name || existingUserByEmail.name,
                    phone: user.user_metadata?.phone || user.phone || existingUserByEmail.phone,
                    role: existingUserByEmail.role, // Preserve existing role
                },
            });
        } else {
            // Normal upsert - either new user or same ID
            dbUser = await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    email: user.email!,
                    name: user.user_metadata?.name || user.user_metadata?.full_name,
                    phone: user.user_metadata?.phone || user.phone,
                    updatedAt: new Date(),
                },
                create: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name || user.user_metadata?.full_name,
                    phone: user.user_metadata?.phone || user.phone,
                    role: "user",
                },
            });
        }

        // Sync role back to Supabase metadata so we can use it in the client
        if (dbUser.role) {
            await supabase.auth.admin.updateUserById(user.id, {
                user_metadata: { role: dbUser.role }
            });
        }

        return NextResponse.json({ user: dbUser });
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
