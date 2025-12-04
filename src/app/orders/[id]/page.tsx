"use client";

import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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
import { ArrowLeft, CheckCircle2, Clock, Loader2, Package, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getOrderDetails, type OrderDetails } from "../order-actions";

export default function OrderDetailsPage() {
    const { user, isLoading } = useAuth();
    const params = useParams();
    const orderId = params.id as string;
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrder() {
            if (user?.id && orderId) {
                setIsLoadingOrder(true);
                const data = await getOrderDetails(orderId, user.id);
                if (data) {
                    setOrder(data);
                } else {
                    setError("Order not found or you don't have permission to view it.");
                }
                setIsLoadingOrder(false);
            } else {
                setIsLoadingOrder(false);
            }
        }
        fetchOrder();
    }, [user?.id, orderId]);

    if (isLoading || isLoadingOrder) {
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

    if (error || !order) {
        return (
            <div className="container flex h-[50vh] flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Order Not Found</h1>
                <p className="text-muted-foreground">{error || "The order you're looking for doesn't exist."}</p>
                <Button asChild>
                    <Link href="/orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    const steps = [
        { label: "Placed", icon: Clock, status: "pending" },
        { label: "Payment", icon: CreditCard, status: "awaiting_payment" },
        { label: "Ready", icon: Package, status: "ready_for_pickup" },
        { label: "Completed", icon: CheckCircle2, status: "completed" },
    ];

    // Determine current step based on order status
    const statusToStep: Record<string, number> = {
        "Pending": 0,
        "Awaiting Payment": 1,
        "Ready for Pickup": 2,
        "Completed": 3,
        "Cancelled": -1,
    };
    const currentStepIndex = statusToStep[order.status] ?? 0;

    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/orders">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-muted-foreground">
                        Placed on {order.date} • <span className="font-mono text-xs">{order.id.substring(0, 8)}...</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Timeline */}
                    {order.status !== "Cancelled" && (
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
                    )}

                    {/* Order Items */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Items ({order.items.length})</CardTitle>
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
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{item.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">₱{item.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                ₱{(item.quantity * item.price).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="font-bold text-right pt-4">
                                            Total Amount
                                        </TableCell>
                                        <TableCell className="font-bold text-right pt-4 text-lg">
                                            ₱{order.total.toLocaleString()}
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
                                            : order.status === "Cancelled"
                                                ? "destructive"
                                                : order.status === "Ready for Pickup"
                                                    ? "default"
                                                    : "secondary"
                                    }
                                    className={order.status === "Ready for Pickup" ? "bg-green-600" : ""}
                                >
                                    {order.status}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground block">Payment</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                                {order.paymentStatus && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                        {order.paymentStatus}
                                    </Badge>
                                )}
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground block">Customer</span>
                                <p className="text-sm font-medium">{order.customerName}</p>
                                <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            </div>
                            {order.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-1">
                                        <span className="text-sm text-muted-foreground block">Notes</span>
                                        <p className="text-sm">{order.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
