import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative h-[600px] w-full overflow-hidden bg-primary">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-primary/90 z-10" />
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop')",
                }}
            />

            <div className="container relative z-20 flex h-full flex-col justify-center gap-4 text-primary-foreground">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-2xl">
                    Wear Your Pride, <br />
                    <span className="text-white">Adamson Style.</span>
                </h1>
                <p className="max-w-[600px] text-lg text-primary-foreground/90 sm:text-xl">
                    The official store for Adamson University apparel, accessories, and
                    supplies. Get the latest gear and show your school spirit.
                </p>
                <div className="flex gap-4 mt-4">
                    <Link href="/category/apparel">
                        <Button size="lg" className="font-semibold bg-white text-primary hover:bg-white/90">
                            Shop Apparel
                        </Button>
                    </Link>
                    <Link href="/category/accessories">
                        <Button size="lg" variant="outline" className="font-semibold border-white text-white hover:bg-white hover:text-primary bg-transparent">
                            View Accessories
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
