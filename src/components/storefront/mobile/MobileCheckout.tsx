"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store, Wallet, LogIn, UserPlus, Loader2, ShoppingCart, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createOrder } from "@/app/checkout/actions";
import { GCashPaymentModal } from "@/components/checkout/GCashPaymentModal";

export function MobileCheckout() {
    const { getSelectedCartItems, selectedTotal, selectedCount, selectedItems } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const [showItems, setShowItems] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: user?.user_metadata?.name?.split(" ")[0] || "",
        lastName: user?.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
        phone: user?.user_metadata?.phone || (user as any)?.phone || "",
        email: user?.email || ""
    });

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<{ id: string, amount: number } | null>(null);

    const checkoutItems = getSelectedCartItems();
    const total = selectedTotal;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!user) return;

        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
            toast.error("Please fill in all contact information");
            return;
        }

        setIsPlacingOrder(true);

        // Pass the IDs of the selected cart items
        const itemIds = checkoutItems.map(item => item.id);

        const result = await createOrder({
            userId: user.id,
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerPhone: formData.phone,
            customerEmail: formData.email,
            items: itemIds,
        } as any);

        setIsPlacingOrder(false);

        if (result.success && result.orderId) {
            setOrderData({ id: result.orderId, amount: result.amount || total });
            setPaymentModalOpen(true);
        } else {
            toast.error(result.error || "Failed to place order");
        }
    };

    // Loading state
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    // Require login
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 gap-5 min-h-[60vh]">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <LogIn className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold">Sign in to Continue</h1>
                    <p className="text-sm text-muted-foreground">
                        You need to be logged in to complete your purchase.
                    </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                    <Link href="/login?redirect=/checkout" className="w-full">
                        <Button className="w-full h-12 gap-2">
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/register?redirect=/checkout" className="w-full">
                        <Button variant="outline" className="w-full h-12 gap-2">
                            <UserPlus className="h-4 w-4" />
                            Create Account
                        </Button>
                    </Link>
                </div>
                <Link href="/cart" className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                    <ArrowLeft className="h-3 w-3" />
                    Back to Cart
                </Link>
            </div>
        );
    }

    // No items selected
    if (checkoutItems.length === 0 || selectedItems.size === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 min-h-[60vh]">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-xl font-bold">No Items Selected</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Please select items from your cart to checkout.
                </p>
                <Link href="/cart">
                    <Button className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cart
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full pb-28">
            {/* Header */}
            <div className="sticky top-14 z-30 bg-background border-b px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/cart" className="p-1 -ml-1">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Checkout</h1>
                        <p className="text-xs text-muted-foreground">
                            {checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''} ({selectedCount} qty)
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 py-4 space-y-4">
                {/* Order Summary - Collapsible */}
                <div className="rounded-xl border bg-card overflow-hidden">
                    <button
                        onClick={() => setShowItems(!showItems)}
                        className="w-full flex items-center justify-between p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-sm">Order Summary</p>
                                <p className="text-xs text-muted-foreground">{selectedCount} items</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">₱{total.toFixed(2)}</span>
                            {showItems ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                    </button>

                    {/* Items List */}
                    {showItems && (
                        <div className="border-t px-4 py-3 space-y-3 max-h-[300px] overflow-y-auto">
                            {checkoutItems.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {item.size && `Size: ${item.size}`}
                                            {item.size && item.color && " • "}
                                            {item.color && `${item.color}`}
                                        </p>
                                        <p className="text-xs">
                                            Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold text-primary">
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pickup Information */}
                <div className="rounded-xl border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Pickup Information</p>
                            <p className="text-xs text-muted-foreground">Store pickup only</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">First Name</label>
                                <input
                                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Last Name</label>
                                <input
                                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Phone Number</label>
                            <input
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                placeholder="0912 345 6789"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Email Address</label>
                            <input
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-xl border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Payment Method</p>
                            <p className="text-xs text-muted-foreground">How you&apos;ll pay</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5">
                        <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">GCash</p>
                            <p className="text-xs text-muted-foreground">
                                Upload proof of payment after placing order
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom */}
            <div className="fixed bottom-16 left-0 right-0 bg-background border-t px-4 py-3 z-40">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">₱{total.toFixed(2)}</span>
                </div>
                <Button className="w-full h-12 font-semibold text-base" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                    {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Order
                </Button>
            </div>

            {orderData && (
                <GCashPaymentModal
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                    orderId={orderData.id}
                    amount={orderData.amount}
                />
            )}
        </div>
    );
}
