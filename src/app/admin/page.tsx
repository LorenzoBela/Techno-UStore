import { Overview } from "@/components/admin/Overview";
import { RecentSales } from "@/components/admin/RecentSales";
import { RecentOrdersWidget } from "@/components/admin/RecentOrdersWidget";
import { TopProducts } from "@/components/admin/TopProducts";
import { RecentUsersWidget } from "@/components/admin/RecentUsersWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import {
    getDashboardStats,
    getMonthlyRevenue,
    getRecentOrders,
    getRecentSales,
    getTopProducts,
    getRecentUsers,
} from "./dashboard-actions";
import { DashboardContent } from "@/components/admin/DashboardContent";

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const [stats, monthlyRevenue, recentOrders, recentSales, topProducts, recentUsers] = await Promise.all([
        getDashboardStats(),
        getMonthlyRevenue(),
        getRecentOrders(5),
        getRecentSales(5),
        getTopProducts(5),
        getRecentUsers(5),
    ]);

    // Calculate percentage changes
    const orderChange = stats.lastMonthOrders > 0
        ? ((stats.thisMonthOrders - stats.lastMonthOrders) / stats.lastMonthOrders * 100).toFixed(1)
        : stats.thisMonthOrders > 0 ? "+100" : "0";

    return (
        <DashboardContent
            stats={stats}
            orderChange={orderChange}
            monthlyRevenue={monthlyRevenue}
            recentOrders={recentOrders}
            recentSales={recentSales}
            topProducts={topProducts}
            recentUsers={recentUsers}
        />
    );
}
