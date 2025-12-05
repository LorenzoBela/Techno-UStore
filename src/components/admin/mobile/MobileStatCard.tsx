import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

export function MobileStatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
}: MobileStatCardProps) {
    return (
        <Card className={cn("touch-manipulation", className)}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-xl font-bold">{value}</p>
                        {subtitle && (
                            <p className={cn(
                                "text-xs",
                                trend === "up" && "text-green-600",
                                trend === "down" && "text-red-600",
                                trend === "neutral" && "text-muted-foreground",
                                !trend && "text-muted-foreground"
                            )}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

