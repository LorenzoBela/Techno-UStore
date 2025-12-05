"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";

export default function CartPage() {
    const { 
        items, 
        removeItem, 
        updateQuantity, 
        isLoading,
        selectedItems,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems,
        selectedCount,
        selectedTotal,
    } = useCart();

    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));
    const someSelected = items.some(item => selectedItems.has(item.id));

    if (isLoading) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container flex flex-col items-center justify-center py-20 gap-4">
                <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
                <p className="text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
                <Link href="/">
                    <Button>Start Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        {/* Select All Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Checkbox 
                                    checked={allSelected}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            selectAllItems();
                                        } else {
                                            deselectAllItems();
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium">
                                    {allSelected ? "Deselect All" : "Select All"} ({items.length} items)
                                </span>
                            </div>
                            {someSelected && (
                                <span className="text-sm text-muted-foreground">
                                    {selectedItems.size} of {items.length} selected
                                </span>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col gap-6">
                                {items.map((item) => {
                                    const isSelected = selectedItems.has(item.id);
                                    const hasVariantInfo = item.size || item.color;
                                    
                                    return (
                                        <div 
                                            key={`${item.id}-${item.size}`} 
                                            className={`flex gap-4 p-3 rounded-lg transition-colors ${isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'}`}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex items-center">
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleItemSelection(item.id)}
                                                />
                                            </div>

                                            {/* Image */}
                                            <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted flex-shrink-0">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No Image</div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="flex justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold">{item.name}</h3>
                                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                                            {item.category && (
                                                                <p>
                                                                    <span className="text-muted-foreground/70">Category:</span>{" "}
                                                                    {item.category}
                                                                    {item.subcategory && ` / ${item.subcategory}`}
                                                                </p>
                                                            )}
                                                            {hasVariantInfo ? (
                                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                                    {item.size && (
                                                                        <p>
                                                                            <span className="text-muted-foreground/70">Size:</span>{" "}
                                                                            <span className="font-medium text-foreground">{item.size}</span>
                                                                        </p>
                                                                    )}
                                                                    {item.color && (
                                                                        <p>
                                                                            <span className="text-muted-foreground/70">Color/Variant:</span>{" "}
                                                                            <span className="font-medium text-foreground">{item.color}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-amber-600 dark:text-amber-400 text-xs">
                                                                    Standard item (no variants)
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold text-lg">₱{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            × ₱{item.price.toFixed(2)} each
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm sticky top-8">
                        <div className="p-6">
                            <h3 className="font-semibold leading-none tracking-tight mb-4">Order Summary</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Cart Total ({items.length} items)</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Selected Items</span>
                                    <span className="font-medium">{selectedItems.size} items ({selectedCount} qty)</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Checkout Total</span>
                                    <span className="text-primary">₱{selectedTotal.toFixed(2)}</span>
                                </div>
                                {selectedItems.size === 0 && (
                                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/50 p-2 rounded">
                                        Please select at least one item to checkout
                                    </p>
                                )}
                                <Link href="/checkout">
                                    <Button 
                                        className="w-full mt-2" 
                                        disabled={selectedItems.size === 0}
                                    >
                                        Checkout Selected ({selectedItems.size})
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
