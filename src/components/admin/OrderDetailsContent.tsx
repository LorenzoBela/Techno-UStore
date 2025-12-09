"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, X, Loader2, Calendar, Wallet } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getOrderById, updateOrderStatus, verifyPayment } from "@/app/admin/orders/order-actions";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

interface OrderDetailsContentProps {
    id: string;
}

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: { label: "Under Review", variant: "secondary" },
        awaiting_payment: { label: "Awaiting Payment", variant: "outline" },
        ready_for_pickup: { label: "Ready for Pickup", variant: "default" },
        completed: { label: "Completed", variant: "default" },
        cancelled: { label: "Cancelled", variant: "destructive" },
        // Fallbacks
        Pending: { label: "Pending", variant: "outline" },
        Processing: { label: "Processing", variant: "secondary" },
        Completed: { label: "Completed", variant: "default" },
        Cancelled: { label: "Cancelled", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
}

export function OrderDetailsContent({ id }: OrderDetailsContentProps) {
    const { isMobile } = useDeviceDetect();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);

    // Dialog States
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [pickupDate, setPickupDate] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [proofImageOpen, setProofImageOpen] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        setIsLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
        setIsLoading(false);
    }

    async function handleVerify() {
        if (!pickupDate) {
            toast.error("Please set a pickup date");
            return;
        }
        if (!user) return;

        setIsVerifying(true);
        const dateObj = new Date(pickupDate);
        const result = await verifyPayment(id, user.id, "verify", undefined, dateObj);

        setIsVerifying(false);
        if (result.success) {
            toast.success("Payment verified and pickup date set");
            setVerifyDialogOpen(false);
            loadOrder();
        } else {
            toast.error(result.error);
        }
    }

    async function handleReject() {
        if (!rejectionReason) {
            toast.error("Please provide a reason");
            return;
        }
        if (!user) return;

        setIsVerifying(true);
        const result = await verifyPayment(id, user.id, "reject", rejectionReason);

        setIsVerifying(false);
        if (result.success) {
            toast.success("Payment rejected");
            setRejectDialogOpen(false);
            loadOrder();
        } else {
            toast.error(result.error);
        }
    }

    async function handleMarkAsPickedUp() {
        if (!user) return;

        setIsVerifying(true);
        const result = await updateOrderStatus(id, "completed", order?.version, user.id);
        setIsVerifying(false);

        if (result.success) {
            toast.success("Order marked as picked up and completed!");
            loadOrder();
        } else {
            toast.error(result.error || "Failed to update order");
        }
    }

    const handleStatusChange = async (value: string) => {
        const result = await updateOrderStatus(id, value as any, order?.version, user?.id);
        if (result.success) {
            toast.success(`Order status updated to ${value}`);
            loadOrder();
        } else {
            toast.error(result.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!order) return <div className="p-8">Order not found</div>;

    const statusDisplay = getStatusDisplay(order.status);

    const renderVerificationSection = () => (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 mb-6">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-500">
                    <Wallet className="h-4 w-4" />
                    Payment Verification
                </CardTitle>
                <CardDescription>Review the payment proof uploaded by the customer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                                <div className="flex items-center gap-2">
                                    <Badge variant={order.paymentStatus === 'verified' ? 'default' : order.paymentStatus === 'rejected' ? 'destructive' : 'secondary'}>
                                        {(order.paymentStatus || 'Pending').toUpperCase()}
                                    </Badge>
                                    {order.paymentVerifiedAt && (
                                        <span className="text-xs text-muted-foreground">
                                            on {new Date(order.paymentVerifiedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {order.paymentProofUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => setProofImageOpen(true)}
                                >
                                    <Wallet className="h-4 w-4" />
                                    View Proof
                                </Button>
                            )}
                        </div>

                        {order.paymentStatus === 'rejected' && order.paymentRejectionReason && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                <span className="font-semibold">Reason:</span> {order.paymentRejectionReason}
                            </div>
                        )}

                        {order.scheduledPickupDate && (
                            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                                <span className="font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Pickup Scheduled: {new Date(order.scheduledPickupDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {/* Accept/Reject buttons for pending payments */}
                            {(order.paymentStatus === 'pending' || !order.paymentStatus) && order.paymentProofUrl && (
                                <>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                        onClick={() => setVerifyDialogOpen(true)}
                                    >
                                        <Check className="h-4 w-4" />
                                        Accept & Set Pickup
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={() => setRejectDialogOpen(true)}
                                    >
                                        <X className="h-4 w-4" />
                                        Reject Payment
                                    </Button>
                                </>
                            )}

                            {/* Mark as Picked Up button for ready_for_pickup orders */}
                            {order.status === 'ready_for_pickup' && (
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    onClick={handleMarkAsPickedUp}
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    Mark as Picked Up
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b md:p-8 md:pt-6">
                <Link href="/admin/orders">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight">Order {id.slice(0, 8)}...</h2>
                <div className="ml-auto">
                    <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 space-y-4">
                {renderVerificationSection()}

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
                                    {order.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-muted relative overflow-hidden">
                                                        {item.productImage && <Image src={item.productImage} alt={item.productName} fill className="object-cover" />}
                                                    </div>
                                                    <span className="font-medium">{item.productName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">₱{item.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">₱{(item.price * item.quantity).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg">₱{order.total.toFixed(2)}</TableCell>
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
                            <CardContent className="space-y-4">
                                <div className="grid gap-1">
                                    <span className="font-medium text-sm">Name</span>
                                    <span className="text-sm text-muted-foreground">{order.customer}</span>
                                </div>
                                <div className="grid gap-1">
                                    <span className="font-medium text-sm">Email</span>
                                    <a href={`mailto:${order.email}`} className="text-sm text-primary hover:underline">{order.email}</a>
                                </div>
                                <div className="grid gap-1">
                                    <span className="font-medium text-sm">Phone</span>
                                    <a href={`tel:${order.phone}`} className="text-sm text-primary hover:underline">{order.phone}</a>
                                </div>
                                {order.notes && (
                                    <div className="grid gap-1">
                                        <span className="font-medium text-sm">Notes</span>
                                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">{order.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Manual Status Update</CardTitle>
                                <CardDescription>Override the current order status.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select defaultValue={order.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Under Review</SelectItem>
                                        <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                                        <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Verify Dialog */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Accept Payment & Set Pickup</DialogTitle>
                        <DialogDescription>
                            Confirm that the payment is valid and schedule a pickup date for the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Pickup Date</Label>
                            <Input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleVerify} disabled={isVerifying} className="bg-green-600 hover:bg-green-700">
                            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Confirm Acceptance
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this payment which will be shown to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason</Label>
                            <Input
                                placeholder="e.g., Invalid screenshot, Amount mismatch"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isVerifying}>
                            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog open={proofImageOpen} onOpenChange={setProofImageOpen}>
                <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden bg-black/90 border-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Payment Proof Preview</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {order?.paymentProofUrl && (
                            <img
                                src={order.paymentProofUrl}
                                alt="Proof Full Size"
                                className="max-w-full max-h-full object-contain"
                            />
                        )}
                        <Button
                            variant="ghost"
                            className="absolute top-2 right-2 text-white hover:bg-white/20"
                            onClick={() => setProofImageOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
