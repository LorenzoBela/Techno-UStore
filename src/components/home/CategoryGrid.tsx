import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Backpack, NotebookPen, GraduationCap } from "lucide-react";

const categories = [
    {
        title: "Apparel",
        icon: ShoppingBag,
        href: "/category/apparel",
        color: "bg-primary/10 text-primary",
    },
    {
        title: "Accessories",
        icon: Backpack,
        href: "/category/accessories",
        color: "bg-primary/10 text-primary",
    },
    {
        title: "Supplies",
        icon: NotebookPen,
        href: "/category/supplies",
        color: "bg-primary/10 text-primary",
    },
    {
        title: "Uniforms",
        icon: GraduationCap,
        href: "/category/uniforms",
        color: "bg-primary/10 text-primary",
    },
];

export function CategoryGrid() {
    return (
        <section className="py-12">
            <div className="container">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {categories.map((category) => (
                        <Link key={category.title} href={category.href}>
                            <Card className="h-full transition-colors hover:bg-muted/50">
                                <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                                    <div className={`rounded-full p-4 ${category.color}`}>
                                        <category.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-semibold">{category.title}</h3>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
