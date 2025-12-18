"use client";

import * as React from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, ShoppingBag, Clock, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PickupOrder } from "@/app/admin/orders/pickup-calendar/pickup-actions";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";

// Status configuration for display
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Pending", variant: "outline" },
    awaiting_payment: { label: "Awaiting Payment", variant: "outline" },
    ready_for_pickup: { label: "Ready for Pickup", variant: "default" },
    completed: { label: "Completed", variant: "secondary" },
    cancelled: { label: "Cancelled", variant: "destructive" },
};

// Get color class for order based on status and pickup date
const getOrderStatusColor = (status: string, pickupDate: Date | null): { dot: string; bg: string; border: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Green for completed orders - darker green
    if (status === 'completed') {
        return {
            dot: 'bg-green-600',
            bg: 'bg-green-100 dark:bg-green-800/50',
            border: 'border-green-400 dark:border-green-600'
        };
    }

    // Yellow/Amber for ready_for_pickup (on or before pickup date)
    if (status === 'ready_for_pickup') {
        if (pickupDate) {
            const pickup = new Date(pickupDate);
            pickup.setHours(0, 0, 0, 0);
            // If past due, show red
            if (pickup < today) {
                return {
                    dot: 'bg-red-600',
                    bg: 'bg-red-100 dark:bg-red-800/50',
                    border: 'border-red-400 dark:border-red-600'
                };
            }
        }
        return {
            dot: 'bg-amber-500',
            bg: 'bg-amber-100 dark:bg-amber-800/50',
            border: 'border-amber-400 dark:border-amber-600'
        };
    }

    // Red for pending/awaiting payment or any non-picked-up past due
    if (pickupDate) {
        const pickup = new Date(pickupDate);
        pickup.setHours(0, 0, 0, 0);
        if (pickup < today && status !== 'cancelled') {
            return {
                dot: 'bg-red-600',
                bg: 'bg-red-100 dark:bg-red-800/50',
                border: 'border-red-400 dark:border-red-600'
            };
        }
    }

    // Default gray for cancelled
    if (status === 'cancelled') {
        return {
            dot: 'bg-gray-500',
            bg: 'bg-gray-100 dark:bg-gray-800/50',
            border: 'border-gray-400 dark:border-gray-600'
        };
    }

    // Red for pending/awaiting payment (not yet ready)
    return {
        dot: 'bg-red-600',
        bg: 'bg-red-100 dark:bg-red-800/50',
        border: 'border-red-400 dark:border-red-600'
    };
};

interface PickupCalendarContentProps {
    initialOrders: PickupOrder[];
}

export function PickupCalendarContent({ initialOrders }: PickupCalendarContentProps) {
    const { isMobile } = useDeviceDetect();
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    // Generate calendar grid days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const jumpToToday = () => setCurrentMonth(new Date());

    // Filter orders for specific operations
    const getOrdersForDate = (date: Date) => {
        return initialOrders.filter((order) =>
            order.scheduledPickupDate && isSameDay(new Date(order.scheduledPickupDate), date)
        );
    };

    // Get upcoming pickups (from today onwards, not completed/cancelled)
    const getUpcomingPickups = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return initialOrders
            .filter((order) => {
                if (!order.scheduledPickupDate) return false;
                if (order.status === 'completed' || order.status === 'cancelled') return false;
                const pickupDate = new Date(order.scheduledPickupDate);
                pickupDate.setHours(0, 0, 0, 0);
                return pickupDate >= today;
            })
            .sort((a, b) => {
                const dateA = new Date(a.scheduledPickupDate!);
                const dateB = new Date(b.scheduledPickupDate!);
                return dateA.getTime() - dateB.getTime();
            })
            .slice(0, 10); // Show max 10 upcoming
    };

    const upcomingPickups = getUpcomingPickups();

    const handleDateClick = (date: Date) => {
        const orders = getOrdersForDate(date);
        if (orders.length > 0) {
            setSelectedDate(date);
            setIsDialogOpen(true);
        }
    };

    // Heatmap Color Logic
    const getHeatmapColor = (count: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return "bg-muted/20 text-muted-foreground";
        if (count === 0) return "bg-background hover:bg-muted/50";

        // Gradient levels based on "tons" (Red), "medium" (Yellow), "so on" (Green)
        if (count <= 3) return "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-900"; // Low
        if (count <= 9) return "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 border-yellow-200 dark:border-yellow-900"; // Medium
        return "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-900"; // High (Tons)
    };

    const selectedOrders = selectedDate ? getOrdersForDate(selectedDate) : [];

    if (isMobile) {
        // Simplified Mobile View - List of upcoming pickups for the month
        // Filter orders for the current month view
        const monthlyOrders = initialOrders.filter(o =>
            o.scheduledPickupDate && isSameMonth(new Date(o.scheduledPickupDate), currentMonth)
        );

        return (
            <div className="flex flex-col min-h-screen bg-background pb-8">
                <MobileHeader title="Pickup Calendar" showBack backHref="/admin/orders" />
                <div className="flex-1 p-4 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-lg">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {monthlyOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>No pickups scheduled for this month.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Group by day */}
                            {Array.from(new Set(monthlyOrders.map(o => format(new Date(o.scheduledPickupDate!), 'yyyy-MM-dd'))))
                                .sort()
                                .map(dateStr => {
                                    const dayOrders = monthlyOrders.filter(o => format(new Date(o.scheduledPickupDate!), 'yyyy-MM-dd') === dateStr);
                                    const dateObj = new Date(dateStr);

                                    // Mobile heatmap indicator
                                    let borderColor = "border-l-4 border-l-transparent";
                                    if (dayOrders.length > 9) borderColor = "border-l-4 border-l-red-500";
                                    else if (dayOrders.length > 3) borderColor = "border-l-4 border-l-yellow-500";
                                    else if (dayOrders.length > 0) borderColor = "border-l-4 border-l-green-500";

                                    return (
                                        <Card key={dateStr} className={`overflow-hidden ${borderColor}`}>
                                            <CardHeader className="py-3 bg-muted/30">
                                                <CardTitle className="text-sm font-semibold flex items-center">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                    {format(dateObj, 'EEE, MMM d')}
                                                    <Badge className="ml-auto" variant="secondary">{dayOrders.length} Orders</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 gap-3 grid">
                                                {dayOrders.map(order => {
                                                    // Determine left border color based on status
                                                    let orderBorderClass = "border-l-4 border-l-red-500";
                                                    if (order.status === 'completed') {
                                                        orderBorderClass = "border-l-4 border-l-green-500";
                                                    } else if (order.status === 'ready_for_pickup') {
                                                        const pickup = order.scheduledPickupDate ? new Date(order.scheduledPickupDate) : null;
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        if (pickup) pickup.setHours(0, 0, 0, 0);
                                                        orderBorderClass = pickup && pickup < today ? "border-l-4 border-l-red-500" : "border-l-4 border-l-yellow-500";
                                                    }

                                                    return (
                                                        <div key={order.id} className={`border-b last:border-0 pb-3 last:pb-0 pl-2 ${orderBorderClass}`}>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-medium text-sm">{order.customerName}</span>
                                                                <Badge variant={statusConfig[order.status]?.variant || 'outline'} className="text-[10px] px-1 py-0 h-5">
                                                                    {statusConfig[order.status]?.label || order.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mb-1 flex items-center">
                                                                <ShoppingBag className="mr-1 h-3 w-3" />
                                                                {order.items.length} Items
                                                            </div>
                                                            <div className="pl-4 text-xs text-muted-foreground">
                                                                {order.items.map((i, idx) => (
                                                                    <div key={idx}>• {i.productName} (x{i.quantity})</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            }
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Grid View
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Pickup Calendar</h2>
                <div className="flex items-center space-x-2">

                    {/* Legend */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mr-4">
                        <div className="flex items-center"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm mr-1"></div> Low (1-3)</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-sm mr-1"></div> Medium (4-9)</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm mr-1"></div> High (10+)</div>
                    </div>

                    <Button variant="outline" onClick={jumpToToday}>
                        Today
                    </Button>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-40 text-center font-semibold">
                            {format(currentMonth, "MMMM yyyy")}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Sidebar Toggle Button */}
                    <Button
                        variant={isSidebarOpen ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="gap-2"
                    >
                        {isSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                        <span className="hidden sm:inline">{isSidebarOpen ? "Hide" : "Show"} Timeline</span>
                    </Button>
                </div>
            </div>

            {/* Calendar and Timeline Sidebar */}
            <div className="flex gap-4 lg:gap-6 overflow-hidden">
                {/* Calendar */}
                <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
                    <Card className="w-full">
                        <CardContent className="p-0">
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 border-b">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="p-4 text-center font-semibold text-sm text-muted-foreground border-r last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 auto-rows-[140px]">
                                {calendarDays.map((day, dayIdx) => {
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const orders = getOrdersForDate(day);
                                    const isTodayDate = isToday(day);
                                    const bgClass = getHeatmapColor(orders.length, isCurrentMonth);

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={`
                                    relative p-2 border-b border-r transition-colors cursor-pointer
                                    ${bgClass}
                                    ${!isCurrentMonth ? "opacity-60" : ""}
                                    ${dayIdx % 7 === 6 ? "border-r-0" : ""} 
                                `}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            <div className={`flex items-center justify-between`}>
                                                <span
                                                    className={`
                                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                            ${isTodayDate ? "bg-primary text-primary-foreground" : ""}
                                        `}
                                                >
                                                    {format(day, "d")}
                                                </span>
                                                {orders.length > 0 && (
                                                    <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                                                        {orders.length}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="mt-2 space-y-1 overflow-hidden max-h-[90px]">
                                                {orders.slice(0, 3).map((order) => {
                                                    const orderColor = getOrderStatusColor(order.status, order.scheduledPickupDate ? new Date(order.scheduledPickupDate) : null);
                                                    return (
                                                        <div
                                                            key={order.id}
                                                            className={`text-xs p-1 rounded ${orderColor.bg} backdrop-blur-sm border ${orderColor.border} truncate font-medium flex items-center`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${orderColor.dot} mr-1.5 flex-shrink-0`} />
                                                            {order.customerName}
                                                        </div>
                                                    );
                                                })}
                                                {orders.length > 3 && (
                                                    <div className="text-xs text-muted-foreground pl-1">
                                                        + {orders.length - 3} more...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Pickups Timeline Sidebar */}
                <div className={`
                    transition-all duration-300 ease-in-out flex-shrink-0
                    ${isSidebarOpen ? 'w-80 lg:w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
                `}>
                    <Card className="h-full bg-gradient-to-b from-background to-muted/20">
                        <CardHeader className="pb-4 border-b bg-muted/30">
                            <CardTitle className="text-lg flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <span className="block">Upcoming Pickups</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {upcomingPickups.length} pending order{upcomingPickups.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
                                {upcomingPickups.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground px-6">
                                        <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                            <CalendarIcon className="h-10 w-10 opacity-30" />
                                        </div>
                                        <p className="text-sm font-medium">No upcoming pickups</p>
                                        <p className="text-xs mt-1">All orders have been picked up!</p>
                                    </div>
                                ) : (
                                    <div className="relative px-6 py-5">
                                        {/* Timeline line */}
                                        <div className="absolute left-[32px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-primary/50 via-border to-border" />

                                        {upcomingPickups.map((order, idx) => {
                                            const orderColor = getOrderStatusColor(order.status, order.scheduledPickupDate ? new Date(order.scheduledPickupDate) : null);
                                            const pickupDate = new Date(order.scheduledPickupDate!);
                                            const isTodays = isToday(pickupDate);

                                            return (
                                                <div key={order.id} className="relative mb-5 last:mb-0 ml-6">
                                                    {/* Timeline dot with ring */}
                                                    <div className={`absolute -left-[22px] top-3 w-4 h-4 rounded-full border-[3px] border-background shadow-sm ${orderColor.dot}`}>
                                                        {isTodays && <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
                                                    </div>

                                                    <div className={`p-4 rounded-xl ${orderColor.bg} border-2 ${orderColor.border} shadow-sm hover:shadow-md transition-shadow`}>
                                                        {/* Date header */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-xs font-bold uppercase tracking-wide ${isTodays ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                {isTodays ? '📍 Today' : format(pickupDate, 'EEE, MMM d')}
                                                            </span>
                                                            <Badge variant={statusConfig[order.status]?.variant || 'outline'} className="text-[10px] px-2 py-0.5">
                                                                {statusConfig[order.status]?.label || order.status}
                                                            </Badge>
                                                        </div>

                                                        {/* Customer name */}
                                                        <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                            <div className="p-1 rounded bg-background/50">
                                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </div>
                                                            {order.customerName}
                                                        </div>

                                                        {/* Items list */}
                                                        <div className="text-xs text-muted-foreground space-y-1">
                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                <ShoppingBag className="h-3 w-3" />
                                                                {order.items.length} item{order.items.length !== 1 ? 's' : ''} to pickup
                                                            </div>
                                                            <div className="pl-4 space-y-0.5">
                                                                {order.items.slice(0, 2).map((item, i) => (
                                                                    <div key={i} className="truncate">• {item.productName}</div>
                                                                ))}
                                                                {order.items.length > 2 && (
                                                                    <div className="text-muted-foreground/70">+ {order.items.length - 2} more...</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Pickups for {selectedDate && format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
                        <DialogDescription>
                            {selectedOrders.length} orders scheduled for pickup.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-4">
                            {selectedOrders.map((order) => (
                                <Card key={order.id}>
                                    <CardHeader className="py-3 bg-muted/40">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{order.customerName}</span>
                                            </div>
                                            <Badge variant={statusConfig[order.status]?.variant || 'outline'}>{statusConfig[order.status]?.label || order.status}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-3">
                                        <div className="text-sm font-medium mb-2 text-muted-foreground">Items to Pickup:</div>
                                        <ul className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center text-sm border-b border-dashed pb-2 last:border-0 last:pb-0">
                                                    <span>{item.productName}</span>
                                                    <Badge variant="outline">x{item.quantity}</Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                            {selectedOrders.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No orders for this date.
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
