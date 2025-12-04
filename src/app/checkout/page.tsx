"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store, Wallet } from "lucide-react";

export default function CheckoutPage() {
    const { items } = useCart();

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = subtotal; // No shipping fee

    if (items.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-4">
                <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
                <Link href="/">
                    <Button>Start Shopping</Button>
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
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="0912 345 6789" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" placeholder="john.doe@example.com" />
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
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={`${item.id}-${item.size}`} className="flex gap-3 text-sm">
                                            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted flex-shrink-0">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col">
                                                <span className="font-medium line-clamp-1">{item.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    Qty: {item.quantity}
                                                    {item.size && ` • ${item.size}`}
                                                </span>
                                            </div>
                                            <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Pickup</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₱{total.toFixed(2)}</span>
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
