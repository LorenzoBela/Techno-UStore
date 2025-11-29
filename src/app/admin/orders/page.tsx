"use client";

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

const orders = [
    {
        id: "ORD-001",
        customer: "Juan Dela Cruz",
        email: "juan@example.com",
        total: 1200,
        status: "Completed",
        date: "2024-03-15",
    },
    {
        id: "ORD-002",
        customer: "Maria Clara",
        email: "maria@example.com",
        total: 850,
        status: "Processing",
        date: "2024-03-16",
    },
    {
        id: "ORD-003",
        customer: "Jose Rizal",
        email: "jose@example.com",
        total: 450,
        status: "Pending",
        date: "2024-03-17",
    },
    {
        id: "ORD-004",
        customer: "Andres Bonifacio",
        email: "andres@example.com",
        total: 2300,
        status: "Cancelled",
        date: "2024-03-14",
    },
];

export default function OrdersPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            </div>
            <div className="rounded-md border">
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
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
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
                                    <Badge
                                        variant={
                                            order.status === "Completed"
                                                ? "default" // Using default (primary) for completed
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
                                    <Link href={`/admin/orders/${order.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
