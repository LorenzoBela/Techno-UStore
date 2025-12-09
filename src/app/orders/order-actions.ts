"use server";

import { prisma } from "@/lib/db";

export interface UserOrder {
    id: string;
    date: string;
    total: number;
    status: string;
    items: number;
}

export interface OrderDetails {
    id: string;
    date: string;
    status: string;
    total: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string | null;
    paymentMethod: string;
    paymentStatus: string | null;
    scheduledPickupDate?: string | null;
    paymentRejectionReason?: string | null;
    // Timeline timestamps
    createdAt: string;
    paymentUploadedAt?: string | null;
    paymentVerifiedAt?: string | null;
    pickedUpAt?: string | null;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        image: string | null;
    }[];
}

export async function getUserOrders(userId: string): Promise<UserOrder[]> {
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return orders.map((order) => ({
            id: order.id,
            date: order.createdAt.toISOString().split("T")[0],
            total: Number(order.totalAmount),
            status: formatStatus(order.status),
            items: order.items.length,
        }));
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
}

export async function getOrderDetails(orderId: string, userId: string): Promise<OrderDetails | null> {
    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                payment: true,
            },
        });

        if (!order) return null;

        return {
            id: order.id,
            date: order.createdAt.toISOString().split("T")[0],
            status: formatStatus(order.status),
            total: Number(order.totalAmount),
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            notes: order.notes,
            paymentMethod: order.payment ? "GCash" : "Pending",
            paymentStatus: order.payment?.status || null,
            scheduledPickupDate: (order as any).scheduledPickupDate?.toISOString() || null,
            paymentRejectionReason: order.payment?.rejectionReason || null,
            // Timeline timestamps
            createdAt: order.createdAt.toISOString(),
            paymentUploadedAt: order.payment?.createdAt?.toISOString() || null,
            paymentVerifiedAt: order.payment?.verifiedAt?.toISOString() || null,
            pickedUpAt: (order as any).pickedUpAt?.toISOString() || null,
            items: order.items.map((item) => ({
                id: item.id,
                name: item.product.name,
                quantity: item.quantity,
                price: Number(item.price),
                image: item.product.images[0]?.url || null,
            })),
        };
    } catch (error) {
        console.error("Error fetching order details:", error);
        return null;
    }
}

function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: "Pending Approval",  // After payment proof uploaded, awaiting admin verification
        awaiting_payment: "Awaiting Payment",  // Order placed, waiting for payment proof
        ready_for_pickup: "Ready for Pickup",  // Admin approved, customer can pick up
        completed: "Completed",
        cancelled: "Cancelled",
    };
    return statusMap[status] || status;
}
