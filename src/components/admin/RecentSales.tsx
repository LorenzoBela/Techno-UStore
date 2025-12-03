import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";

interface Sale {
    id: string;
    customer: string;
    email: string;
    total: number;
}

interface RecentSalesProps {
    sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
    if (!sales || sales.length === 0) {
        return (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                No sales yet
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sales.map((sale) => {
                const initials = sale.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                return (
                    <div key={sale.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{sale.customer}</p>
                            <p className="text-sm text-muted-foreground">{sale.email}</p>
                        </div>
                        <div className="ml-auto font-medium">+₱{sale.total.toLocaleString()}</div>
                    </div>
                );
            })}
        </div>
    );
}
