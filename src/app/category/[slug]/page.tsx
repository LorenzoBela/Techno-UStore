import { ProductCard } from "@/components/product/ProductCard";
import { CategorySidebar } from "@/components/product/CategorySidebar";

// Mock data for products
const products = [
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
    {
        id: "6",
        name: "Adamson T-Shirt Blue",
        price: 350,
        category: "Apparel",
        image: "",
        isNew: false,
    },
    {
        id: "7",
        name: "Adamson T-Shirt White",
        price: 350,
        category: "Apparel",
        image: "",
        isNew: false,
    },
    {
        id: "8",
        name: "School Supplies Kit",
        price: 250,
        category: "Supplies",
        image: "",
        isNew: false,
    },
];

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    // Filter products based on category (simple mock filter)
    // In a real app, this would be a DB query
    const filteredProducts = products.filter(
        (product) => product.category.toLowerCase() === slug.toLowerCase()
    );

    return (
        <div className="container py-8">
            {/* Enhanced Header Section */}
            <div className="mb-8 rounded-lg bg-primary/5 p-8 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-primary">{categoryName}</h1>
                <p className="mt-2 text-muted-foreground">
                    Browse our exclusive collection of {categoryName.toLowerCase()}.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <aside className="hidden md:block">
                    <CategorySidebar currentCategory={slug} />
                </aside>

                {/* Mobile Filter (Optional - for now just hiding sidebar on mobile, 
                    but in real app would use a Sheet or Accordion) */}

                {/* Product Grid */}
                <main>
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                            <h3 className="text-xl font-semibold text-muted-foreground">
                                No products found in this category.
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Try selecting a different category from the sidebar.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
