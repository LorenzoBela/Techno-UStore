import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopProduct {
    id: string;
    name: string;
    sales: number;
    image: string | null;
}

interface TopProductsProps {
    products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
    if (!products || products.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No products sold yet
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {products.map((product, index) => {
                const initials = product.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div key={product.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            {product.image && <AvatarImage src={product.image} alt={product.name} />}
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {product.sales} sales
                            </p>
                        </div>
                        <div className="ml-auto font-medium">#{index + 1}</div>
                    </div>
                );
            })}
        </div>
    );
}
