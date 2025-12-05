"use client";

import { useWishlist, WishlistItem } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

function WishlistItemCard({ item }: { item: WishlistItem }) {
    const { removeItem, removeByProductId } = useWishlist();
    const { addItem: addToCart } = useCart();

    const handleRemove = () => {
        if (item.productId) {
            removeByProductId(item.productId);
        } else {
            removeItem(item.id);
        }
        toast.success("Removed from wishlist");
    };

    const handleAddToCart = () => {
        addToCart({
            id: item.productId || item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            category: item.category,
            subcategory: item.subcategory,
        });
        toast.success("Added to cart", {
            description: item.name,
        });
    };

    const productId = item.productId || item.id;

    return (
        <Card className="group overflow-hidden">
            <CardContent className="p-0">
                <div className="flex flex-row">
                    {/* Image */}
                    <Link
                        href={`/product/${productId}`}
                        className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0 overflow-hidden bg-muted rounded-l-lg"
                    >
                        {item.image ? (
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                                sizes="160px"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                No Image
                            </div>
                        )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                            {item.category && (
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    {item.category}
                                </p>
                            )}
                            <Link href={`/product/${productId}`}>
                                <h3 className="font-semibold text-lg hover:underline line-clamp-2">
                                    {item.name}
                                </h3>
                            </Link>
                            <p className="mt-2 text-xl font-bold text-primary">
                                ₱{item.price.toLocaleString()}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={handleRemove}
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MobileWishlistItemCard({ item }: { item: WishlistItem }) {
    const { removeItem, removeByProductId } = useWishlist();
    const { addItem: addToCart } = useCart();

    const handleRemove = () => {
        if (item.productId) {
            removeByProductId(item.productId);
        } else {
            removeItem(item.id);
        }
        toast.success("Removed from wishlist");
    };

    const handleAddToCart = () => {
        addToCart({
            id: item.productId || item.id,
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            category: item.category,
            subcategory: item.subcategory,
        });
        toast.success("Added to cart", {
            description: item.name,
        });
    };

    const productId = item.productId || item.id;

    return (
        <div className="relative bg-card rounded-xl overflow-hidden border">
            <Link href={`/product/${productId}`} className="block">
                <div className="relative aspect-square bg-muted">
                    {item.image ? (
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="50vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                            No Image
                        </div>
                    )}
                </div>
            </Link>

            {/* Remove button */}
            <button
                onClick={handleRemove}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-md"
                aria-label="Remove from wishlist"
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </button>

            {/* Info */}
            <div className="p-3 space-y-2">
                {item.category && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {item.category}
                    </p>
                )}
                <Link href={`/product/${productId}`}>
                    <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
                </Link>
                <p className="text-sm font-bold text-primary">
                    ₱{item.price.toLocaleString()}
                </p>

                <Button
                    size="sm"
                    className="w-full gap-2 h-9"
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                </Button>
            </div>
        </div>
    );
}

function EmptyWishlist() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                Start adding items you love to your wishlist. Click the heart icon on any product to save it for later.
            </p>
            <Link href="/">
                <Button size="lg" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Continue Shopping
                </Button>
            </Link>
        </div>
    );
}

function WishlistSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                            <div className="aspect-square w-full sm:w-40 md:w-48 bg-muted animate-pulse" />
                            <div className="flex-1 p-4 space-y-3">
                                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                                <div className="flex gap-2 pt-2">
                                    <div className="h-9 w-28 bg-muted animate-pulse rounded" />
                                    <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function MobileWishlistSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <div className="p-3 space-y-2">
                        <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                        <div className="h-9 w-full bg-muted animate-pulse rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function WishlistPage() {
    const { items, isLoading, clearWishlist, wishlistCount } = useWishlist();

    const handleClearAll = () => {
        clearWishlist();
        toast.success("Wishlist cleared");
    };

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block container py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                        <p className="text-muted-foreground mt-1">
                            {wishlistCount} {wishlistCount === 1 ? "item" : "items"} saved
                        </p>
                    </div>
                    {wishlistCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={handleClearAll}
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear All
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <WishlistSkeleton />
                ) : items.length === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <WishlistItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden pb-20">
                {/* Page Header - below mobile store header */}
                <div className="bg-background border-b px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">My Wishlist</h1>
                            <p className="text-sm text-muted-foreground">
                                {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
                            </p>
                        </div>
                        {wishlistCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={handleClearAll}
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                <div className="px-4 py-4">
                    {isLoading ? (
                        <MobileWishlistSkeleton />
                    ) : items.length === 0 ? (
                        <EmptyWishlist />
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {items.map((item) => (
                                <MobileWishlistItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

