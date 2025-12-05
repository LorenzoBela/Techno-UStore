"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store, Wallet, LogIn, UserPlus, Loader2, ShoppingCart } from "lucide-react";
import { MobileCheckout, ResponsiveStorePage } from "@/components/storefront/mobile";

function DesktopCheckout() {
    const { getSelectedCartItems, selectedTotal, selectedCount, selectedItems } = useCart();
    const { user, isLoading: authLoading } = useAuth();

    const checkoutItems = getSelectedCartItems();
    const subtotal = selectedTotal;
    const total = subtotal;

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    // Require login to checkout
    if (!user) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Sign in to Continue</h1>
                    <p className="text-muted-foreground max-w-md">
                        You need to be logged in to complete your purchase. Your cart items will be saved when you sign in.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/login?redirect=/checkout">
                        <Button className="gap-2">
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/register?redirect=/checkout">
                        <Button variant="outline" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Create Account
                        </Button>
                    </Link>
                </div>
                <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" />
                    Back to Cart
                </Link>
            </div>
        );
    }

    // No items selected for checkout
    if (checkoutItems.length === 0 || selectedItems.size === 0) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                <h1 className="text-2xl font-bold">No Items Selected</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    Please go back to your cart and select the items you want to checkout.
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
        <div className="container py-8">
            <div className="mb-8">
                <Link href="/cart" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Cart
                </Link>
                <h1 className="mt-4 text-3xl font-bold">Checkout</h1>
                <p className="text-muted-foreground mt-1">
                    Checking out {checkoutItems.length} item{checkoutItems.length !== 1 ? 's' : ''} ({selectedCount} qty)
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Pickup Information */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Store className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Pickup Information</h2>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            You will need to pick up your order at our store location.
                        </p>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                                        placeholder="John"
                                        defaultValue={user.user_metadata?.name?.split(" ")[0] || ""}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                                        placeholder="Doe"
                                        defaultValue={user.user_metadata?.name?.split(" ").slice(1).join(" ") || ""}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                                    placeholder="0912 345 6789"
                                    defaultValue={user.user_metadata?.phone || user.phone || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                                    placeholder="john.doe@example.com"
                                    defaultValue={user.email || ""}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Payment Method</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 border p-4 rounded-md bg-primary/5 border-primary">
                                <input type="radio" id="gcash" name="payment" className="h-4 w-4" defaultChecked readOnly />
                                <label htmlFor="gcash" className="text-sm font-medium flex-1">GCash</label>
                                <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded">Required</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Please prepare your GCash payment. You will need to upload the proof of payment after placing the order.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm sticky top-8">
                        <div className="p-6">
                            <h3 className="font-semibold leading-none tracking-tight mb-4">Order Summary</h3>
                            <div className="flex flex-col gap-4">
                                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                    {checkoutItems.map((item) => {
                                        const hasVariant = item.size || item.color;
                                        return (
                                            <div key={`${item.id}-${item.size}`} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                                                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted flex-shrink-0">
                                                    {item.image && (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col min-w-0 gap-1">
                                                    <span className="font-semibold line-clamp-1">{item.name}</span>
                                                    <div className="text-muted-foreground text-xs space-y-0.5">
                                                        {item.category && (
                                                            <p>
                                                                <span className="text-muted-foreground/70">Category:</span>{" "}
                                                                {item.category}
                                                                {item.subcategory && ` / ${item.subcategory}`}
                                                            </p>
                                                        )}
                                                        {hasVariant ? (
                                                            <p>
                                                                {item.size && (
                                                                    <><span className="text-muted-foreground/70">Size:</span> <span className="font-medium text-foreground">{item.size}</span></>
                                                                )}
                                                                {item.size && item.color && " • "}
                                                                {item.color && (
                                                                    <><span className="text-muted-foreground/70">Variant:</span> <span className="font-medium text-foreground">{item.color}</span></>
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <p className="text-amber-600 dark:text-amber-400">Standard item</p>
                                                        )}
                                                        <p>
                                                            <span className="text-muted-foreground/70">Qty:</span>{" "}
                                                            <span className="font-medium text-foreground">{item.quantity}</span>
                                                            <span className="text-muted-foreground/70 ml-1">× ₱{item.price.toFixed(2)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-semibold whitespace-nowrap text-primary">₱{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({selectedCount} items)</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Pickup</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">₱{total.toFixed(2)}</span>
                                </div>
                                <Button className="w-full mt-4">Place Order</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CheckoutContent() {
    return (
        <ResponsiveStorePage
            mobileContent={<MobileCheckout />}
            desktopContent={<DesktopCheckout />}
        />
    );
}

