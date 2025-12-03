"use server";

import { prisma } from "@/lib/db";

export interface AdminOrder {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    date: string;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return orders.map((order) => ({
            id: order.id,
            customer: order.customerName || order.user?.name || "Unknown Customer",
            email: order.customerEmail || order.user?.email || "",
            total: order.totalAmount.toNumber(),
            status: order.status,
            date: order.createdAt.toISOString().split("T")[0],
        }));
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        return [];
    }
}

export async function getOrderById(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                payment: true,
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) return null;

        return {
            id: order.id,
            customer: order.customerName || order.user?.name || "Unknown Customer",
            email: order.customerEmail || order.user?.email || "",
            phone: order.customerPhone,
            total: order.totalAmount.toNumber(),
            status: order.status,
            paymentStatus: order.payment?.status || null,
            notes: order.notes,
            date: order.createdAt.toISOString().split("T")[0],
            pickedUpAt: order.pickedUpAt?.toISOString() || null,
            items: order.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.images[0]?.url || "",
                quantity: item.quantity,
                price: item.price.toNumber(),
            })),
        };
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return null;
    }
}
