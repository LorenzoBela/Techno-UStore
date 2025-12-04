"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface AdminOrder {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    date: string;
}

// Revalidate order-related pages
function revalidateOrders() {
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
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

// Update order status with optimistic locking
export async function updateOrderStatus(
    orderId: string, 
    newStatus: "pending" | "awaiting_payment" | "ready_for_pickup" | "completed" | "cancelled",
    expectedCurrentStatus?: string
) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get current order state
            const order = await tx.order.findUnique({
                where: { id: orderId },
                select: { status: true },
            });
            
            if (!order) {
                throw new Error("Order not found. It may have been deleted.");
            }
            
            // Optimistic locking: check if status hasn't changed since admin loaded the page
            if (expectedCurrentStatus && order.status !== expectedCurrentStatus) {
                throw new Error(`Order status has changed to "${order.status}" by another admin. Please refresh and try again.`);
            }
            
            // Update status
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { 
                    status: newStatus,
                    ...(newStatus === "completed" ? { pickedUpAt: new Date() } : {}),
                },
            });
            
            return updated;
        });

        revalidateOrders();
        return { success: true, order: result };
    } catch (error: any) {
        console.error("Error updating order status:", error);
        return { error: error.message || "Failed to update order status" };
    }
}

// Verify payment with concurrency check
export async function verifyPayment(
    orderId: string, 
    adminId: string, 
    action: "verify" | "reject",
    rejectionReason?: string
) {
    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { payment: true },
            });
            
            if (!order) {
                throw new Error("Order not found.");
            }
            
            if (!order.payment) {
                throw new Error("No payment found for this order.");
            }
            
            // Check if already verified/rejected
            if (order.payment.status !== "pending") {
                throw new Error(`Payment has already been ${order.payment.status} by another admin.`);
            }
            
            await tx.payment.update({
                where: { id: order.payment.id },
                data: {
                    status: action === "verify" ? "verified" : "rejected",
                    verifiedBy: adminId,
                    verifiedAt: new Date(),
                    rejectionReason: action === "reject" ? rejectionReason : null,
                },
            });
            
            // Update order status based on payment verification
            if (action === "verify") {
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: "ready_for_pickup" },
                });
            }
        });

        revalidateOrders();
        return { success: true };
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { error: error.message || "Failed to verify payment" };
    }
}
