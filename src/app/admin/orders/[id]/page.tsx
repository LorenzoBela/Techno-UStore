"use client";

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Mock data - in a real app, fetch based on ID
const order = {
    id: "ORD-001",
    customer: "Juan Dela Cruz",
    email: "juan@example.com",
    phone: "+63 912 345 6789",
    address: "900 San Marcelino St, Ermita, Manila, 1000 Metro Manila",
    total: 1200,
    status: "Completed",
    date: "2024-03-15",
    items: [
        {
            id: "1",
            name: "Adamson Hoodie 2024",
            price: 850,
            quantity: 1,
            total: 850,
        },
        {
            id: "2",
            name: "Classic Blue T-Shirt",
            price: 350,
            quantity: 1,
            total: 350,
        },
    ],
};

export default function OrderDetailsPage() {
    const params = useParams();
    const id = params.id;

    const handleStatusChange = (value: string) => {
        toast.success(`Order status updated to ${value}`);
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Order {id}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Order Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-right">₱{item.price}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">₱{item.total}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-bold">
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        ₱{order.total}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid gap-1">
                                <span className="font-medium">Name</span>
                                <span className="text-sm text-muted-foreground">
                                    {order.customer}
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="font-medium">Email</span>
                                <span className="text-sm text-muted-foreground">
                                    {order.email}
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="font-medium">Phone</span>
                                <span className="text-sm text-muted-foreground">
                                    {order.phone}
                                </span>
                            </div>
                            <div className="grid gap-1">
                                <span className="font-medium">Address</span>
                                <span className="text-sm text-muted-foreground">
                                    {order.address}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                            <CardDescription>Update the status of this order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select defaultValue={order.status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
