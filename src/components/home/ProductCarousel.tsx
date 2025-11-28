"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "@/components/ui/section-header"; // Corrected import path casing if needed, assuming file is SectionHeader.tsx

// Mock data
const newArrivals = [
    {
        id: "1",
        name: "Adamson Hoodie 2024",
        price: 850,
        category: "Apparel",
        image: "",
        isNew: true,
    },
    {
        id: "2",
        name: "Classic Falcon Cap",
        price: 350,
        category: "Accessories",
        image: "",
        isNew: true,
    },
    {
        id: "3",
        name: "University Tumbler",
        price: 450,
        category: "Accessories",
        image: "",
        isNew: true,
    },
    {
        id: "4",
        name: "PE Uniform Set",
        price: 1200,
        category: "Uniforms",
        image: "",
        isNew: false,
    },
    {
        id: "5",
        name: "Falcon Lanyard",
        price: 150,
        category: "Accessories",
        image: "",
        isNew: false,
    },
];

export function ProductCarousel() {
    return (
        <section className="py-12">
            <div className="container">
                <SectionHeader title="New Arrivals" description="Check out the latest additions to our store." />
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {newArrivals.map((product) => (
                            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                <ProductCard {...product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    );
}
