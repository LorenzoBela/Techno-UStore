"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function toggleUserBan(userId: string, shouldBan: boolean) {
    const supabaseAdmin = getSupabaseAdmin();

    // Calculate ban duration. If banning, set to a far future date (e.g., 100 years).
    // If unbanning, set to "none" or 0.
    const banDuration = shouldBan ? "876000h" : "none"; // 100 years in hours

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function sendPasswordReset(email: string) {
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
    });

    // Note: generateLink returns a link. If we want to SEND an email, we should use resetPasswordForEmail.
    // However, resetPasswordForEmail uses the configured SMTP server.
    // Let's use resetPasswordForEmail as it's the standard "forgot password" flow.

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings`,
    });

    if (resetError) {
        return { error: resetError.message };
    }

    return { success: true };
}
