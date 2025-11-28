"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew?: boolean;
}

export function ProductCard({
    id,
    name,
    price,
    image,
    category,
    isNew,
}: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        addItem({
            id,
            name,
            price,
            image,
            quantity: 1,
        });
        // Feedback
        toast.success("Added to cart", {
            description: `${name} has been added to your cart.`,
        });
    };

    return (
        <Card className="group overflow-hidden rounded-lg border-0 bg-transparent shadow-none transition-all hover:shadow-md">
            <CardContent className="p-0 relative aspect-square overflow-hidden rounded-lg bg-secondary/20">
                {isNew && (
                    <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
                        New
                    </Badge>
                )}
                <Link href={`/product/${id}`}>
                    <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-105">
                        {/* Placeholder for image until we have real assets */}
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            {image ? (
                                <Image
                                    src={image}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            ) : (
                                <span>No Image</span>
                            )}
                        </div>
                    </div>
                </Link>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
                <div className="text-sm text-muted-foreground">{category}</div>
                <Link href={`/product/${id}`} className="font-semibold hover:underline">
                    {name}
                </Link>
                <div className="flex w-full items-center justify-between">
                    <div className="font-bold">₱{price.toFixed(2)}</div>
                    <Button size="sm" variant="secondary" onClick={handleAddToCart}>
                        Add to Cart
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
