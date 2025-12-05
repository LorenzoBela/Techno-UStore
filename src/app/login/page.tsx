"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    const redirectUrl = searchParams.get("redirect") || "/";

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Check for admin login
        if (email === "admin@technoustore.com" && password === "admin123") {
            document.cookie = "admin_session=true; path=/";
            toast.success("Welcome back, Admin!");
            router.push("/admin");
            return;
        }

        // Use Supabase auth
        const { error } = await signIn(email, password);
        
        if (error) {
            toast.error(error.message || "Invalid credentials");
            setIsLoading(false);
        } else {
            toast.success("Welcome back!");
            router.push(redirectUrl);
        }
    }

    async function handleGoogleSignIn() {
        setIsLoading(true);
        // Store redirect URL in sessionStorage for OAuth callback
        if (redirectUrl !== "/") {
            sessionStorage.setItem("auth_redirect", redirectUrl);
        }
        const { error } = await signInWithGoogle();
        if (error) {
            toast.error(error.message || "Failed to sign in with Google");
            setIsLoading(false);
        }
    }

    // Check for stored redirect on mount (for OAuth callbacks)
    React.useEffect(() => {
        const storedRedirect = sessionStorage.getItem("auth_redirect");
        if (storedRedirect) {
            sessionStorage.removeItem("auth_redirect");
            router.push(storedRedirect);
        }
    }, [router]);

    // Build the register URL with redirect param
    const registerUrl = redirectUrl !== "/" 
        ? `/register?redirect=${encodeURIComponent(redirectUrl)}` 
        : "/register";

    return (
        <div className="container flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email to sign in to your account
                    </p>
                </div>

                <div className="grid gap-6">
                    <form onSubmit={onSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                />
                            </div>
                            <Button className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </div>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Google
                    </Button>
                </div>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link
                        href={registerUrl}
                        className="hover:text-brand underline underline-offset-4"
                    >
                        Don&apos;t have an account? Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="container flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
