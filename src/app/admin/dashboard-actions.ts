"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache dashboard stats for 1 minute (admin needs relatively fresh data)
const getCachedDashboardStats = unstable_cache(
    async () => {
        const [
            totalRevenue,
            totalOrders,
            totalProducts,
            totalUsers,
            thisMonthOrders,
            lastMonthOrders,
        ] = await Promise.all([
            prisma.order.aggregate({
                where: { status: "completed" },
                _sum: { totalAmount: true },
            }),
            prisma.order.count(),
            prisma.product.count(),
            prisma.user.count(),
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.order.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return {
            totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
            totalOrders,
            totalProducts,
            totalUsers,
            thisMonthOrders,
            lastMonthOrders,
        };
    },
    ["dashboard-stats"],
    { revalidate: 60, tags: ["dashboard", "orders", "products"] }
);

// Dashboard stats
export async function getDashboardStats() {
    try {
        return await getCachedDashboardStats();
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
            thisMonthOrders: 0,
            lastMonthOrders: 0,
        };
    }
}

// Monthly revenue for chart - OPTIMIZED: Single query instead of 12
export async function getMonthlyRevenue() {
    try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        
        // Single query to get all completed orders in the date range
        const orders = await prisma.order.findMany({
            where: {
                status: "completed",
                createdAt: { gte: startDate },
            },
            select: {
                totalAmount: true,
                createdAt: true,
            },
        });

        // Group by month in memory (much faster than 12 DB queries)
        const monthlyTotals: Record<string, number> = {};
        
        for (const order of orders) {
            const monthKey = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(order.totalAmount);
        }

        // Build result array for last 12 months
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            months.push({
                name: date.toLocaleString("default", { month: "short" }),
                total: monthlyTotals[monthKey] || 0,
            });
        }

        return months;
    } catch (error) {
        console.error("Error fetching monthly revenue:", error);
        return [];
    }
}

// Recent orders
export async function getRecentOrders(limit = 5) {
    try {
        const orders = await prisma.order.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
            },
        });

        return orders.map((order) => ({
            id: order.id.slice(0, 8).toUpperCase(),
            customer: order.customerName,
            email: order.customerEmail,
            total: Number(order.totalAmount),
            status: order.status,
            createdAt: order.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        return [];
    }
}

// Recent sales (completed orders)
export async function getRecentSales(limit = 5) {
    try {
        const orders = await prisma.order.findMany({
            where: { status: "completed" },
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        return orders.map((order) => ({
            id: order.id,
            customer: order.customerName,
            email: order.customerEmail,
            total: Number(order.totalAmount),
        }));
    } catch (error) {
        console.error("Error fetching recent sales:", error);
        return [];
    }
}

// Top selling products - OPTIMIZED: Single batch query instead of N+1
export async function getTopProducts(limit = 5) {
    try {
        // Step 1: Get top product IDs with sales counts
        const topProducts = await prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: limit,
        });

        if (topProducts.length === 0) return [];

        // Step 2: Batch fetch all products in ONE query (fixes N+1)
        const productIds = topProducts.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                images: { take: 1, select: { url: true } },
            },
        });

        // Create lookup map for O(1) access
        const productMap = new Map(products.map(p => [p.id, p]));

        // Step 3: Combine data
        return topProducts.map(item => {
            const product = productMap.get(item.productId);
            const name = product?.name || "Unknown Product";
            return {
                id: item.productId,
                name,
                sales: item._sum.quantity || 0,
                image: product?.images[0]?.url || "",
                initials: name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
            };
        });
    } catch (error) {
        console.error("Error fetching top products:", error);
        return [];
    }
}

// Recent users
export async function getRecentUsers(limit = 5) {
    try {
        const users = await prisma.user.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
        });

        return users.map((user) => ({
            id: user.id,
            name: user.name || "Unknown User",
            email: user.email,
            createdAt: user.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Error fetching recent users:", error);
        return [];
    }
}

