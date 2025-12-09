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
import { useEffect, useState } from "react";
import { getUserOrders, type UserOrder } from "./order-actions";

export default function OrdersPage() {
    const { user, isLoading } = useAuth();
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            if (user?.id) {
                setIsLoadingOrders(true);
                const data = await getUserOrders(user.id);
                setOrders(data);
                setIsLoadingOrders(false);
            } else {
                setIsLoadingOrders(false);
            }
        }
        fetchOrders();
    }, [user?.id]);

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

    const activeOrders = orders.filter(
        (order) => ["Pending Approval", "Awaiting Payment", "Ready for Pickup"].includes(order.status)
    );
    const historyOrders = orders.filter(
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
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm" asChild>
                        <Link href="/profile">View profile</Link>
                    </Button>
                </div>
            </div>

            <AccountTabs />

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
                    <TabsTrigger value="history">Order History ({historyOrders.length})</TabsTrigger>
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
                            <OrderTable orders={activeOrders} isLoading={isLoadingOrders} />
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
                            <OrderTable orders={historyOrders} isLoading={isLoadingOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const OrderTable = ({ orders, isLoading }: { orders: UserOrder[]; isLoading: boolean }) => (
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
            {isLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                </TableRow>
            ) : orders.length > 0 ? (
                orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium font-mono text-xs">
                            {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.items} {order.items === 1 ? "item" : "items"}</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    order.status === "Completed"
                                        ? "default"
                                        : order.status === "Cancelled"
                                            ? "destructive"
                                            : order.status === "Ready for Pickup"
                                                ? "default"
                                                : "secondary"
                                }
                                className={order.status === "Ready for Pickup" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">₱{order.total.toLocaleString()}</TableCell>
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
