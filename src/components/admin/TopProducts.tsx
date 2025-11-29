import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const topProducts = [
    {
        name: "Adamson Hoodie 2024",
        sales: 120,
        image: "https://example.com/hoodie.jpg", // Replace with actual image or placeholder
        initials: "AH",
    },
    {
        name: "Classic Blue T-Shirt",
        sales: 95,
        image: "https://example.com/tshirt.jpg",
        initials: "CB",
    },
    {
        name: "Engineering Cap",
        sales: 80,
        image: "https://example.com/cap.jpg",
        initials: "EC",
    },
    {
        name: "Falcon Lanyard",
        sales: 65,
        image: "https://example.com/lanyard.jpg",
        initials: "FL",
    },
    {
        name: "University Pin",
        sales: 50,
        image: "https://example.com/pin.jpg",
        initials: "UP",
    },
];

export function TopProducts() {
    return (
        <div className="space-y-8">
            {topProducts.map((product, index) => (
                <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={product.image} alt={product.name} />
                        <AvatarFallback>{product.initials}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {product.sales} sales
                        </p>
                    </div>
                    <div className="ml-auto font-medium">#{index + 1}</div>
                </div>
            ))}
        </div>
    );
}
