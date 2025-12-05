"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { Trash2, Plus, Minus, Loader2, ShoppingBag, ChevronRight } from "lucide-react";

export function MobileCart() {
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

    const allSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading your cart...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 gap-4 min-h-[60vh]">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-xl font-bold">Your Cart is Empty</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Looks like you haven&apos;t added anything yet.
                </p>
                <Link href="/">
                    <Button className="mt-2 gap-2">
                        Start Shopping
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full pb-36">
            {/* Header */}
            <div className="sticky top-14 z-30 bg-background border-b">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold">Shopping Cart</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Select All */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => {
                                if (checked) selectAllItems();
                                else deselectAllItems();
                            }}
                        />
                        <span className="text-sm font-medium">
                            {allSelected ? "Deselect All" : "Select All"}
                        </span>
                    </div>
                    {selectedItems.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                            {selectedItems.size} selected
                        </span>
                    )}
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 px-4 py-4 space-y-3">
                {items.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const hasVariant = item.size || item.color;

                    return (
                        <div
                            key={`${item.id}-${item.size}`}
                            className={`
                                flex gap-3 p-3 rounded-xl border transition-colors
                                ${isSelected ? "border-primary bg-primary/5" : "border-muted"}
                            `}
                        >
                            {/* Checkbox */}
                            <div className="flex items-start pt-1">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleItemSelection(item.id)}
                                />
                            </div>

                            {/* Image */}
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                                    {item.name}
                                </h3>
                                
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                    {item.category && (
                                        <p>{item.category}{item.subcategory ? ` / ${item.subcategory}` : ''}</p>
                                    )}
                                    {hasVariant ? (
                                        <p>
                                            {item.size && <span>Size: {item.size}</span>}
                                            {item.size && item.color && " • "}
                                            {item.color && <span>Variant: {item.color}</span>}
                                        </p>
                                    ) : (
                                        <p className="text-amber-600">Standard item</p>
                                    )}
                                </div>

                                {/* Price & Quantity */}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="font-bold text-primary">
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="h-7 w-7 rounded-full border flex items-center justify-center disabled:opacity-40"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="h-7 w-7 rounded-full border flex items-center justify-center"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="h-7 w-7 rounded-full flex items-center justify-center text-destructive ml-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Bottom Checkout Bar */}
            <div className="fixed bottom-16 left-0 right-0 bg-background border-t px-4 py-3 z-40">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {selectedItems.size > 0 
                                ? `${selectedItems.size} items (${selectedCount} qty)` 
                                : "No items selected"
                            }
                        </p>
                        <p className="text-lg font-bold text-primary">
                            ₱{selectedTotal.toFixed(2)}
                        </p>
                    </div>
                    <Link href="/checkout">
                        <Button
                            size="lg"
                            className="h-12 px-8 font-semibold"
                            disabled={selectedItems.size === 0}
                        >
                            Checkout
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
                {selectedItems.size === 0 && (
                    <p className="text-xs text-amber-600 text-center">
                        Please select items to checkout
                    </p>
                )}
            </div>
        </div>
    );
}

