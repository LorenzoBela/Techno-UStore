"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        // Simple check for the cookie we set in login
        const hasAdminSession = document.cookie
            .split("; ")
            .find((row) => row.startsWith("admin_session="));

        // Check for admin role in user metadata
        const hasAdminRole = user?.user_metadata?.role === "admin";

        if (!hasAdminSession && !hasAdminRole) {
            router.push("/login");
        } else {
            setIsAuthorized(true);
        }
    }, [router, user, isLoading]);

    if (!isAuthorized) {
        return null; // or a loading spinner
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex gap-6 md:gap-10">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="pr-0">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                        <Link href="/admin" className="flex items-center space-x-2">
                            <span className="font-bold inline-block">Admin Dashboard</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                document.cookie =
                                    "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                                router.push("/login");
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <Sidebar />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
