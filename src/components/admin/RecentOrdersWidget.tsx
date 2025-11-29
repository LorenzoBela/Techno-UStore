import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const recentOrders = [
    {
        id: "ORD-005",
        customer: "Pedro Penduko",
        total: 1500,
        status: "Processing",
    },
    {
        id: "ORD-006",
        customer: "Juan Tamad",
        total: 300,
        status: "Completed",
    },
    {
        id: "ORD-007",
        customer: "Maria Makiling",
        total: 4500,
        status: "Pending",
    },
    {
        id: "ORD-008",
        customer: "Lam-ang",
        total: 850,
        status: "Completed",
    },
    {
        id: "ORD-009",
        customer: "Bernardo Carpio",
        total: 2100,
        status: "Cancelled",
    },
];

export function RecentOrdersWidget() {
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
                {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
