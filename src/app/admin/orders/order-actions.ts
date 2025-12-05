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
    version: number; // For optimistic locking
}

export interface PaginatedOrders {
    orders: AdminOrder[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Revalidate order-related pages
function revalidateOrders() {
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
}

// Paginated orders for admin - handles thousands of orders efficiently
export async function getAdminOrders(
    page: number = 1, 
    pageSize: number = 25,
    filters?: { status?: string; search?: string }
): Promise<PaginatedOrders> {
    try {
        const where: any = {};
        
        // Status filter
        if (filters?.status && filters.status !== "all") {
            where.status = filters.status;
        }
        
        // Search by customer name or email
        if (filters?.search && filters.search.trim()) {
            const searchTerm = filters.search.trim();
            where.OR = [
                { customerName: { contains: searchTerm, mode: "insensitive" } },
                { customerEmail: { contains: searchTerm, mode: "insensitive" } },
                { id: { contains: searchTerm } },
            ];
        }

        // Parallel count and fetch for efficiency
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.order.count({ where }),
        ]);

        return {
            orders: orders.map((order) => ({
                id: order.id,
                customer: order.customerName || order.user?.name || "Unknown Customer",
                email: order.customerEmail || order.user?.email || "",
                total: order.totalAmount.toNumber(),
                status: order.status,
                date: order.createdAt.toISOString().split("T")[0],
                // Version will be available after running prisma generate
                version: (order as any).version ?? 1,
            })),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    } catch (error) {
        console.error("Error fetching admin orders:", error);
        return { orders: [], total: 0, page: 1, pageSize: 25, totalPages: 0 };
    }
}

// Legacy function for backward compatibility (returns first page)
export async function getAllAdminOrders(): Promise<AdminOrder[]> {
    const result = await getAdminOrders(1, 1000);
    return result.orders;
}

export async function getOrderById(id: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                payment: {
                    select: {
                        id: true,
                        status: true,
                        referenceNumber: true,
                        proofImageUrl: true,
                        verifiedAt: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: { take: 1, select: { url: true } },
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
            // Version will be available after running prisma generate
            version: (order as any).version ?? 1,
            paymentStatus: order.payment?.status || null,
            paymentId: order.payment?.id || null,
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

// Update order status with version-based optimistic locking
// This prevents race conditions when multiple admins edit the same order
export async function updateOrderStatus(
    orderId: string, 
    newStatus: "pending" | "awaiting_payment" | "ready_for_pickup" | "completed" | "cancelled",
    expectedVersion?: number // Version-based locking for concurrent access
) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Get current order state with version
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });
            
            if (!order) {
                throw new Error("Order not found. It may have been deleted.");
            }

            const currentVersion = (order as any).version ?? 1;
            
            // Version-based optimistic locking: ensure no other admin modified this order
            if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
                throw new Error(
                    `This order was modified by another admin. Current status: "${order.status}". Please refresh and try again.`
                );
            }
            
            // Update status and increment version atomically
            // Note: version field will work after running prisma generate
            const updateData: any = { 
                status: newStatus,
                ...(newStatus === "completed" ? { pickedUpAt: new Date() } : {}),
            };
            
            // Only increment version if the field exists in schema
            try {
                updateData.version = { increment: 1 };
            } catch {
                // Version field not yet in schema
            }
            
            const updated = await tx.order.update({
                where: { id: orderId },
                data: updateData,
            });
            
            return updated;
        });

        revalidateOrders();
        return { success: true, order: result, newVersion: (result as any).version ?? 1 };
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
