"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Order {
    id: string;
    customer: string;
    email: string;
    date: string;
    status: string;
    total: number;
}

interface MobileOrderCardProps {
    order: Order;
}

function getStatusDisplay(status: string) {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: { label: "Pending", variant: "outline" },
        awaiting_payment: { label: "Awaiting Payment", variant: "secondary" },
        ready_for_pickup: { label: "Ready", variant: "secondary" },
        completed: { label: "Completed", variant: "default" },
        cancelled: { label: "Cancelled", variant: "destructive" },
    };
    return statusMap[status] || { label: status, variant: "outline" };
}

export function MobileOrderCard({ order }: MobileOrderCardProps) {
    const statusDisplay = getStatusDisplay(order.status);

    return (
        <Link href={`/admin/orders/${order.id}`}>
            <Card className="touch-manipulation active:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <Badge variant={statusDisplay.variant} className="text-xs">
                                    {statusDisplay.label}
                                </Badge>
                            </div>
                            <p className="text-sm truncate">{order.customer}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{order.date}</span>
                                <span className="font-semibold text-sm">
                                    ₱{order.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-2 shrink-0" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

