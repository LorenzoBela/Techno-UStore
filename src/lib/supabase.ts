import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for browser/client components
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (supabaseClient) return supabaseClient;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            `Supabase configuration missing. Check your .env file for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`
        );
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
        },
    });

    return supabaseClient;
}

// Create Supabase admin client for server-side operations
let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (supabaseAdmin) return supabaseAdmin;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            `Supabase admin configuration missing. Check your .env file for SUPABASE_SERVICE_ROLE_KEY.`
        );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return supabaseAdmin;
}

// Export a default client for convenience
export const supabase = typeof window !== "undefined" ? getSupabaseClient() : null;
