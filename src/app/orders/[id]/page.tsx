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
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, CheckCircle2, Circle, Clock, Loader2, Package, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const mockOrderDetails = {
    id: "ORD-001",
    date: "2024-03-15",
    status: "Completed",
    total: 1200,
    items: [
        {
            id: "1",
            name: "Wireless Mouse",
            quantity: 1,
            price: 500,
        },
        {
            id: "2",
            name: "Mechanical Keyboard",
            quantity: 1,
            price: 700,
        },
    ],
    shippingAddress: "123 Tech Street, Silicon Valley, CA",
    paymentMethod: "GCash",
};

export default function OrderDetailsPage() {
    const { user, isLoading } = useAuth();
    const params = useParams();
    const orderId = params.id as string;

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
                <p className="text-muted-foreground">Please log in to view order details.</p>
                <Button asChild>
                    <a href="/login">Go to Login</a>
                </Button>
            </div>
        );
    }

    // In a real app, fetch order details by ID here
    const order = mockOrderDetails; // Using mock data

    const steps = [
        { label: "Placed", icon: Clock, status: "completed" },
        { label: "Processing", icon: Package, status: "completed" },
        { label: "Shipped", icon: Truck, status: "completed" },
        { label: "Delivered", icon: CheckCircle2, status: "completed" },
    ];

    // Simple logic to determine step status based on order status
    // In a real app, this would be more dynamic
    const currentStepIndex = order.status === "Completed" ? 3 : order.status === "Processing" ? 1 : 0;

    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order {orderId}</h1>
                    <p className="text-muted-foreground">
                        Placed on {order.date}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Timeline */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative flex justify-between">
                                {/* Connecting Line */}
                                <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-10" />
                                <div
                                    className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                />

                                {steps.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.label} className="flex flex-col items-center gap-2 bg-background px-2">
                                            <div
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                                    isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background text-muted-foreground",
                                                    isCurrent && "ring-4 ring-primary/20"
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                isCompleted ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">₱{item.price}</TableCell>
                                            <TableCell className="text-right">
                                                ₱{item.quantity * item.price}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="font-bold text-right pt-4">
                                            Total Amount
                                        </TableCell>
                                        <TableCell className="font-bold text-right pt-4 text-lg">
                                            ₱{order.total}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge
                                    variant={
                                        order.status === "Completed"
                                            ? "default"
                                            : order.status === "Processing"
                                                ? "secondary"
                                                : "outline"
                                    }
                                >
                                    {order.status}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground block">Payment Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground block">Shipping Address</span>
                                <p className="text-sm font-medium leading-relaxed">
                                    {order.shippingAddress}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
