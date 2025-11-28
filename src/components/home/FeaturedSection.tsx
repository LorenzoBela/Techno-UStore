import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FeaturedSection() {
    return (
        <section className="py-12 bg-muted/50">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-background">
                        {/* Placeholder for featured image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            Featured Image
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Limited Edition: 90th Anniversary Collection
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Celebrate 90 years of excellence with our exclusive anniversary collection.
                            Premium quality materials with special commemorative designs.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/category/apparel">
                                <Button size="lg">Shop Collection</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
