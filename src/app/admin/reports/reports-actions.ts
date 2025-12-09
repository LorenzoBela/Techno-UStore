"use server";

import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// Get sales revenue grouped by category
export async function getSalesByCategory() {
    try {
        // Since we don't have a direct OrderItem -> Category relation, we need to join through Product
        // This might be expensive with many orders, so we should limit to recent orders or cache it
        // For now, let's fetch all completed order items and aggregate in memory

        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    status: "completed"
                }
            },
            include: {
                product: {
                    include: {
                        category: true
                    }
                }
            }
        });

        const categorySales: Record<string, number> = {};

        for (const item of orderItems) {
            const categoryName = item.product.category.name;
            const amount = Number(item.price) * item.quantity;
            categorySales[categoryName] = (categorySales[categoryName] || 0) + amount;
        }

        return Object.entries(categorySales).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);

    } catch (error) {
        console.error("Error fetching sales by category:", error);
        return [];
    }
}

// Get order status distribution
export async function getOrderStatusDistribution() {
    try {
        const distribution = await prisma.order.groupBy({
            by: ["status"],
            _count: {
                _all: true
            }
        });

        // Map status to readable format if needed, or just return as is
        return distribution.map(item => ({
            name: item.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            value: item._count._all
        }));
    } catch (error) {
        console.error("Error fetching order status distribution:", error);
        return [];
    }
}

// Get inventory health stats (Low stock vs In stock)
// Assuming "Low Stock" is < 10 items
export async function getInventoryHealth() {
    try {
        const LOW_STOCK_THRESHOLD = 10;

        const [lowStock, inStock, outOfStock] = await Promise.all([
            prisma.product.count({
                where: {
                    stock: {
                        gt: 0,
                        lte: LOW_STOCK_THRESHOLD
                    }
                }
            }),
            prisma.product.count({
                where: {
                    stock: {
                        gt: LOW_STOCK_THRESHOLD
                    }
                }
            }),
            prisma.product.count({
                where: {
                    stock: {
                        equals: 0
                    }
                }
            })
        ]);

        return [
            { name: "In Stock", value: inStock, fill: "#22c55e" }, // green-500
            { name: "Low Stock", value: lowStock, fill: "#eab308" }, // yellow-500
            { name: "Out of Stock", value: outOfStock, fill: "#ef4444" }, // red-500
        ];
    } catch (error) {
        console.error("Error fetching inventory health:", error);
        return [];
    }
}

// Get user growth over last 6 months
export async function getUserGrowth() {
    try {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo
                }
            },
            select: {
                createdAt: true
            }
        });

        const monthlyGrowth: Record<string, number> = {};

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            monthlyGrowth[key] = 0;
        }

        // Count users
        for (const user of users) {
            const key = `${user.createdAt.getFullYear()}-${user.createdAt.getMonth()}`;
            if (monthlyGrowth[key] !== undefined) {
                monthlyGrowth[key]++;
            }
        }

        // Format for chart
        return Object.entries(monthlyGrowth).map(([key, value]) => {
            const [year, month] = key.split('-').map(Number);
            const date = new Date(year, month, 1);
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                users: value
            };
        });

    } catch (error) {
        console.error("Error fetching user growth:", error);
        return [];
    }
}
