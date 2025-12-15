import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section
            className="relative h-[600px] w-full overflow-hidden"
            style={{ backgroundColor: '#1f3a93' }}
        >
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 z-10" style={{ backgroundColor: 'rgba(31, 58, 147, 0.9)' }} />
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-overlay"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop')",
                }}
            />

            <div className="container relative z-20 flex h-full flex-col justify-center gap-4 text-white">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-2xl text-white">
                    Wear Your Pride, <br />
                    <span className="text-white/90">Adamson Style.</span>
                </h1>
                <p className="max-w-[600px] text-lg text-white/80 sm:text-xl">
                    The official store for Adamson University apparel, accessories, and
                    supplies. Get the latest gear and show your school spirit.
                </p>
                <div className="flex gap-4 mt-4">
                    <Link href="/category/apparel">
                        <Button size="lg" variant="outline" className="font-semibold border-white text-white hover:bg-white hover:text-[#1f3a93] bg-transparent">
                            Shop Apparel
                        </Button>
                    </Link>
                    <Link href="/category/accessories">
                        <Button size="lg" variant="outline" className="font-semibold border-white text-white hover:bg-white hover:text-[#1f3a93] bg-transparent">
                            View Accessories
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

