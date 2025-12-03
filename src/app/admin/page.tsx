import { Overview } from "@/components/admin/Overview";
import { RecentSales } from "@/components/admin/RecentSales";
import { RecentOrdersWidget } from "@/components/admin/RecentOrdersWidget";
import { TopProducts } from "@/components/admin/TopProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import {
    getDashboardStats,
    getMonthlyRevenue,
    getRecentOrders,
    getRecentSales,
    getTopProducts,
} from "./dashboard-actions";

export default async function AdminDashboardPage() {
    const [stats, monthlyRevenue, recentOrders, recentSales, topProducts] = await Promise.all([
        getDashboardStats(),
        getMonthlyRevenue(),
        getRecentOrders(5),
        getRecentSales(5),
        getTopProducts(5),
    ]);

    // Calculate percentage changes
    const orderChange = stats.lastMonthOrders > 0
        ? ((stats.thisMonthOrders - stats.lastMonthOrders) / stats.lastMonthOrders * 100).toFixed(1)
        : stats.thisMonthOrders > 0 ? "+100" : "0";

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
        </div>
    );
}
