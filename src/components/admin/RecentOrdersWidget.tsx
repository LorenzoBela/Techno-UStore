import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RecentOrder {
    id: string;
    customer: string;
    total: number;
    status: string;
}

interface RecentOrdersWidgetProps {
    orders: RecentOrder[];
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

export function RecentOrdersWidget({ orders }: RecentOrdersWidgetProps) {
    if (!orders || orders.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No orders yet
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => {
                    const statusDisplay = getStatusDisplay(order.status);
                    return (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>
                                <Badge variant={statusDisplay.variant}>
                                    {statusDisplay.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">₱{order.total.toLocaleString()}</TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
