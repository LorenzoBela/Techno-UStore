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

// Monthly revenue for chart
export async function getMonthlyRevenue() {
    try {
        const now = new Date();
        const months = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const revenue = await prisma.order.aggregate({
                where: {
                    status: "completed",
                    createdAt: {
                        gte: date,
                        lt: nextMonth,
                    },
                },
                _sum: { totalAmount: true },
            });

            months.push({
                name: date.toLocaleString("default", { month: "short" }),
                total: Number(revenue._sum.totalAmount || 0),
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

// Top selling products
export async function getTopProducts(limit = 5) {
    try {
        const topProducts = await prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: "desc" } },
            take: limit,
        });

        const productsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    include: { images: true },
                });
                return {
                    id: item.productId,
                    name: product?.name || "Unknown Product",
                    sales: item._sum.quantity || 0,
                    image: product?.images[0]?.url || "",
                    initials: (product?.name || "UP")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase(),
                };
            })
        );

        return productsWithDetails;
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

