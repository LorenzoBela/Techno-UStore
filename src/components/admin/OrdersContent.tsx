"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { MobileOrderCard } from "@/components/admin/mobile/MobileOrderCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";

interface Order {
    id: string;
    customer: string;
    email: string;
    date: string;
    status: string;
    total: number;
}

interface OrdersContentProps {
    orders: Order[];
    total: number;
    totalPages: number;
    page: number;
    status: string;
    search: string;
}

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: { label: "Pending", variant: "outline" },
        awaiting_payment: { label: "Awaiting Payment", variant: "secondary" },
        ready_for_pickup: { label: "Ready for Pickup", variant: "secondary" },
        completed: { label: "Completed", variant: "default" },
        cancelled: { label: "Cancelled", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
}

export function OrdersContent({
    orders,
    total,
    totalPages,
    page,
    status,
    search,
}: OrdersContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    const buildUrl = (newPage: number) => {
        const params = new URLSearchParams();
        params.set("page", newPage.toString());
        if (status !== "all") params.set("status", status);
        if (search) params.set("search", search);
        return `/admin/orders?${params.toString()}`;
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader title="Orders" />

                <div className="flex-1 p-4 space-y-4">
                    <div className="space-y-3">
                        <form>
                            <Input
                                name="search"
                                placeholder="Search orders..."
                                defaultValue={search}
                            />
                        </form>

                        <form>
                            <input type="hidden" name="search" value={search} />
                            <Select name="status" defaultValue={status}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                                    <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </form>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {total.toLocaleString()} orders
                    </p>

                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">
                                {search || status !== "all" ? "No orders match your filters" : "No orders yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <MobileOrderCard key={order.id} order={order} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <Link href={buildUrl(Math.max(1, page - 1))}>
                                <Button variant="outline" size="sm" disabled={page <= 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                {page} / {totalPages}
                            </span>
                            <Link href={buildUrl(Math.min(totalPages, page + 1))}>
                                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop View
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                <div className="text-sm text-muted-foreground">
                    {total.toLocaleString()} total orders
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <form className="flex-1 max-w-sm">
                    <Input
                        name="search"
                        placeholder="Search by name, email, or order ID..."
                        defaultValue={search}
                        className="w-full"
                    />
                </form>
                <form>
                    <input type="hidden" name="search" value={search} />
                    <Select name="status" defaultValue={status}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                            <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </form>
            </div>

            <div className="rounded-md border">
                {orders.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        {search || status !== "all" ? "No orders match your filters" : "No orders yet"}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const statusDisplay = getStatusDisplay(order.status);
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{order.customer}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {order.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusDisplay.variant}>
                                                {statusDisplay.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">₱{order.total.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/orders?page=1&status=${status}&search=${search}`}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/admin/orders?page=${page - 1}&status=${status}&search=${search}`}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/admin/orders?page=${page + 1}&status=${status}&search=${search}`}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/admin/orders?page=${totalPages}&status=${status}&search=${search}`}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

