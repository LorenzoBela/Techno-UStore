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
import { getAdminOrders } from "./order-actions";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

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

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);
    const status = params.status || "all";
    const search = params.search || "";
    
    const { orders, total, totalPages } = await getAdminOrders(page, 25, {
        status: status !== "all" ? status : undefined,
        search: search || undefined,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                <div className="text-sm text-muted-foreground">
                    {total.toLocaleString()} total orders
                </div>
            </div>

            {/* Filters */}
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

            {/* Pagination */}
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
