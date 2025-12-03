import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { getAdminOrders } from "./order-actions";

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

export default async function OrdersPage() {
    const orders = await getAdminOrders();
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            </div>
            <div className="rounded-md border">
                {orders.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        No orders yet
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
        </div>
    );
}
