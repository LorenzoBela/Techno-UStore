"use client";

import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { AccountTabs } from "@/components/layout/AccountTabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for demonstration
const mockOrders = [
    {
        id: "ORD-001",
        date: "2024-03-15",
        total: 1200,
        status: "Completed",
        items: 3,
    },
    {
        id: "ORD-005",
        date: "2024-03-20",
        total: 2500,
        status: "Processing",
        items: 1,
    },
    {
        id: "ORD-006",
        date: "2024-03-22",
        total: 850,
        status: "Pending",
        items: 2,
    },
    {
        id: "ORD-002",
        date: "2024-02-10",
        total: 450,
        status: "Cancelled",
        items: 1,
    },
];

export default function OrdersPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container flex h-[50vh] flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Not Authenticated</h1>
                <p className="text-muted-foreground">Please log in to view your orders.</p>
                <Button asChild>
                    <a href="/login">Go to Login</a>
                </Button>
            </div>
        );
    }

    const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const activeOrders = mockOrders.filter(
        (order) => ["Pending", "Processing", "Shipped"].includes(order.status)
    );
    const historyOrders = mockOrders.filter(
        (order) => ["Completed", "Cancelled"].includes(order.status)
    );

    return (
        <div className="container max-w-5xl py-10">
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm">
                        View profile
                    </Button>
                </div>
            </div>

            <AccountTabs />

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="px-0">
                            <CardTitle>Active Orders</CardTitle>
                            <CardDescription>
                                Orders currently in progress.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <OrderTable orders={activeOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history" className="space-y-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="px-0">
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>
                                Past completed and cancelled orders.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <OrderTable orders={historyOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const OrderTable = ({ orders }: { orders: typeof mockOrders }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.length > 0 ? (
                orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items} items</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    order.status === "Completed"
                                        ? "default"
                                        : order.status === "Processing"
                                            ? "secondary"
                                            : order.status === "Cancelled"
                                                ? "destructive"
                                                : "outline"
                                }
                            >
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">₱{order.total}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/orders/${order.id}`}>
                                    View Details
                                </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
);
