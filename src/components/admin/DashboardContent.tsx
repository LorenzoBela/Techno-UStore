"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { Overview } from "@/components/admin/Overview";
import { RecentSales } from "@/components/admin/RecentSales";
import { RecentOrdersWidget } from "@/components/admin/RecentOrdersWidget";
import { TopProducts } from "@/components/admin/TopProducts";
import { RecentUsersWidget } from "@/components/admin/RecentUsersWidget";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { MobileStatCard } from "@/components/admin/mobile/MobileStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

interface DashboardContentProps {
    stats: {
        totalRevenue: number;
        totalOrders: number;
        totalProducts: number;
        totalUsers: number;
        thisMonthOrders: number;
        lastMonthOrders: number;
    };
    orderChange: string;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    recentOrders: Array<{ id: string; customer: string; date: string; status: string; total: number }>;
    recentSales: Array<{ id: string; customer: string; email: string; total: number }>;
    topProducts: Array<{ id: string; name: string; sales: number; image: string | null }>;
    recentUsers: Array<{ id: string; name: string; email: string; createdAt: string }>;
}

export function DashboardContent({
    stats,
    orderChange,
    monthlyRevenue,
    recentOrders,
    recentSales,
    topProducts,
    recentUsers,
}: DashboardContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Mobile Dashboard
    if (isMobile) {
        const orderTrend = Number(orderChange) >= 0 ? "up" : "down";

        function getStatusColor(status: string) {
            const colors: Record<string, string> = {
                pending: "bg-yellow-500",
                awaiting_payment: "bg-orange-500",
                ready_for_pickup: "bg-blue-500",
                completed: "bg-green-500",
                cancelled: "bg-red-500",
            };
            return colors[status] || "bg-gray-500";
        }

        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader title="Dashboard" />
                
                <div className="flex-1 p-4 space-y-4">
                    {/* Stats Grid - 2x2 on mobile */}
                    <div className="grid grid-cols-2 gap-3">
                        <MobileStatCard
                            title="Revenue"
                            value={`₱${stats.totalRevenue.toLocaleString()}`}
                            subtitle="From completed"
                            icon={DollarSign}
                        />
                        <MobileStatCard
                            title="Orders"
                            value={stats.totalOrders}
                            subtitle={`${Number(orderChange) >= 0 ? "+" : ""}${orderChange}%`}
                            icon={ShoppingCart}
                            trend={orderTrend as "up" | "down"}
                        />
                        <MobileStatCard
                            title="Products"
                            value={stats.totalProducts}
                            subtitle="In catalog"
                            icon={Package}
                        />
                        <MobileStatCard
                            title="Users"
                            value={stats.totalUsers}
                            subtitle="Registered"
                            icon={Users}
                        />
                    </div>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Recent Orders</CardTitle>
                                <Link 
                                    href="/admin/orders" 
                                    className="text-xs text-primary flex items-center gap-1"
                                >
                                    View all
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No orders yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentOrders.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={`/admin/orders/${order.id}`}
                                            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className={`h-2 w-2 rounded-full ${getStatusColor(order.status)}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {order.customer}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.date}
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                ₱{order.total.toLocaleString()}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Top Products
                                </CardTitle>
                                <Link 
                                    href="/admin/products" 
                                    className="text-xs text-primary flex items-center gap-1"
                                >
                                    View all
                                    <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No products yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {topProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="text-sm font-bold text-muted-foreground w-5">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.soldCount} sold
                                                </p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                ₱{product.revenue.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/admin/products/new"
                                    className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                                >
                                    <Package className="h-4 w-4" />
                                    Add Product
                                </Link>
                                <Link
                                    href="/admin/orders"
                                    className="flex items-center gap-2 p-3 rounded-lg bg-muted font-medium text-sm hover:bg-muted/80 transition-colors"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    View Orders
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Desktop Dashboard
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From completed orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {Number(orderChange) >= 0 ? "+" : ""}{orderChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">Total in catalog</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={monthlyRevenue} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {recentSales.length > 0 ? `Latest ${recentSales.length} completed orders` : "No sales yet"}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <RecentSales sales={recentSales} />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentOrdersWidget orders={recentOrders} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TopProducts products={topProducts} />
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentUsersWidget users={recentUsers} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

