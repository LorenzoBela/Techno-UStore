import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import Image from "next/image";

// Mock data for a single product (in a real app, fetch by ID)
const getProduct = (id: string) => {
    // Just returning a generic product for any ID for now
    return {
        id,
        name: "Adamson Hoodie 2024",
        price: 850,
        description:
            "Official Adamson University Hoodie. Made with high-quality cotton blend material for comfort and durability. Features the classic Adamson Falcon logo embroidered on the chest. Perfect for everyday wear or showing your school spirit at games.",
        category: "Apparel",
        images: [
            "", // Placeholder
        ],
        sizes: ["XS", "S", "M", "L", "XL", "2XL"],
        inStock: true,
    };
};

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = getProduct(id);

    return (
        <div className="container py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {/* Product Image Section */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        {product.images[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-semibold">No Image Available</span>
                        )}
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                            {product.category}
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {product.name}
                        </h1>
                        <div className="mt-4 text-3xl font-bold text-primary">
                            ₱{product.price.toFixed(2)}
                        </div>
                    </div>

                    <div className="prose prose-stone text-muted-foreground">
                        <p>{product.description}</p>
                    </div>

                    {/* Size Selector */}
                    <div>
                        <h3 className="mb-3 text-sm font-medium">Select Size</h3>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <Button
                                    key={size}
                                    variant="outline"
                                    className="h-10 w-10 p-0 hover:border-primary hover:text-primary"
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row mt-6">
                        <Button size="lg" className="flex-1 gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2">
                            <Heart className="h-5 w-5" />
                            Wishlist
                        </Button>
                        <Button size="icon" variant="ghost">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
                        <p>
                            <span className="font-semibold text-foreground">Availability:</span>{" "}
                            {product.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                        <p className="mt-2">
                            <span className="font-semibold text-foreground">Shipping:</span>{" "}
                            Standard shipping rates apply. Free shipping on orders over ₱1000.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
