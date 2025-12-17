"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, metadata?: { name?: string; phone?: string }) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signInWithMicrosoft: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sync user to database
async function syncUserToDatabase(accessToken: string, retried = false): Promise<any> {
    try {
        const response = await fetch("/api/auth/sync", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // If 401 and haven't retried, try refreshing the session first
            if (response.status === 401 && !retried) {
                console.log("Sync returned 401, attempting to refresh token...");
                const supabase = getSupabaseClient();
                const { data: { session: newSession } } = await supabase.auth.refreshSession();
                if (newSession?.access_token) {
                    return syncUserToDatabase(newSession.access_token, true);
                }
            }
            // Non-critical: user is still authenticated via Supabase
            console.warn(`Sync returned ${response.status}, continuing without DB sync`);
            return null;
        }

        return await response.json();
    } catch (error) {
        // Non-critical error - user is still authenticated via Supabase
        console.warn("Failed to sync user to database (non-critical):", error);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseClient();

        // Helper to clear stale auth data
        const clearAuthState = async () => {
            setSession(null);
            setUser(null);
            setIsLoading(false);
            // Try to sign out to clear any stale tokens
            try {
                await supabase.auth.signOut({ scope: 'local' });
            } catch {
                // Ignore errors during cleanup
            }
        };

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
                // Check for refresh token errors and clear stale auth
                if (error.message?.includes("Refresh Token") || error.message?.includes("refresh_token")) {
                    console.warn("Stale refresh token detected, clearing auth state");
                    await clearAuthState();
                    return;
                }
                setSession(null);
                setUser(null);
                setIsLoading(false);
                return;
            }
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);

            // Sync user to database on initial load if logged in
            if (session?.access_token) {
                syncUserToDatabase(session.access_token).then((data) => {
                    console.log("Initial sync complete:", data);
                    // If we have a role in the DB but not in the session, refresh
                    if (data?.user?.role && session.user.user_metadata?.role !== data.user.role) {
                        console.log("Refreshing session to get updated role...");
                        supabase.auth.refreshSession().catch(() => {
                            // If refresh fails, just continue with current session
                        });
                    }
                });
            }
        }).catch(async (error) => {
            console.error("Failed to get session:", error);
            await clearAuthState();
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Handle TOKEN_REFRESHED error or session issues
            if (event === "TOKEN_REFRESHED" && !session) {
                console.warn("Token refresh failed, clearing session");
                await clearAuthState();
                return;
            }

            // Handle sign out event
            if (event === "SIGNED_OUT") {
                setSession(null);
                setUser(null);
                setIsLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);

            // Sync user to database on sign in
            if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.access_token) {
                console.log("Auth event:", event, "Syncing...");
                const data = await syncUserToDatabase(session.access_token);
                console.log("Sync complete:", data);

                // If we have a role in the DB but not in the session, refresh
                if (data?.user?.role && session.user.user_metadata?.role !== data.user.role) {
                    console.log("Refreshing session to get updated role...");
                    try {
                        const { data: { session: newSession } } = await supabase.auth.refreshSession();
                        if (newSession) {
                            setSession(newSession);
                            setUser(newSession.user);
                        }
                    } catch {
                        // If refresh fails, continue with current session
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, metadata?: { name?: string; phone?: string }) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        // If signup succeeded and we have a session, sync immediately
        // This handles cases where email confirmation is disabled
        if (!error && data.session?.access_token) {
            console.log("Signup succeeded with session, syncing user to database...");
            await syncUserToDatabase(data.session.access_token);
        }

        return { error };
    };

    const signOut = async () => {
        const supabase = getSupabaseClient();
        // Clear state immediately for responsive UI
        setSession(null);
        setUser(null);
        // Then sign out from Supabase
        await supabase.auth.signOut();
        // Clear admin session cookie as well
        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    };

    const signInWithGoogle = async () => {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        return { error };
    };

    const signInWithMicrosoft = async () => {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "azure",
            options: {
                redirectTo: `${window.location.origin}/`,
                scopes: "email profile openid",
            },
        });
        return { error };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signIn,
                signUp,
                signOut,
                signInWithGoogle,
                signInWithMicrosoft,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
