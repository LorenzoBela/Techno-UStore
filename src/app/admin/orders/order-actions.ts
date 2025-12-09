"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSystemLog, getServerAdmin } from "@/lib/logger";

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
                        rejectionReason: true,
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
            paymentProofUrl: order.payment?.proofImageUrl || null,
            paymentRejectionReason: order.payment?.rejectionReason || null,
            paymentVerifiedAt: order.payment?.verifiedAt?.toISOString() || null,
            notes: order.notes,
            date: order.createdAt.toISOString().split("T")[0],
            scheduledPickupDate: order.scheduledPickupDate?.toISOString() || null,
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
    expectedVersion?: number, // Version-based locking for concurrent access
    adminId?: string // Admin ID for logging who made the change
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
            const updateData: any = {
                status: newStatus,
                version: { increment: 1 },
            };

            // If marking as completed, log the pickup time and who completed it
            if (newStatus === "completed") {
                updateData.pickedUpAt = new Date();
                if (adminId) {
                    updateData.completedBy = adminId;
                }
            }

            const updated = await tx.order.update({
                where: { id: orderId },
                data: updateData,
            });

            return updated;
        });

        // Log the action (outside transaction to not block it)
        await createSystemLog({
            action: newStatus === 'completed' ? 'ORDER_COMPLETED' :
                newStatus === 'cancelled' ? 'ORDER_CANCELLED' : 'ORDER_UPDATED',
            entityId: orderId,
            entityType: 'Order',
            details: `Status changed to ${newStatus}`,
            userId: adminId,
            userEmail: adminId ? undefined : 'unknown',
        });

        revalidateOrders();
        return {
            success: true,
            newVersion: (result as any).version ?? 1,
            status: result.status
        };
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
    rejectionReason?: string,
    pickupDate?: Date
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

            // Check if already verified/rejected (optional: allow re-verify?)
            // If rejected, user might re-upload (new status pending).
            // So only block if currently Verified?
            // "only if accepted they'll be notified... if rejected reason why"
            // If rejected, status is rejected. If they reupload, status becomes pending.

            if (order.payment.status === "verified" && action === "verify") {
                // Idempotent success or error? Let's generic error.
                throw new Error("Payment is already verified.");
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
                    data: {
                        status: "ready_for_pickup",
                        scheduledPickupDate: pickupDate
                    },
                });
            } else if (action === "reject") {
                // Return to awaiting_payment so user can try again? or cancelled?
                // "if rejected... notified on their dash... the reason why"
                // Probably keep as pending or set to awaiting_payment.
                // Let's set to awaiting_payment to indicate they need to pay (upload) again.
                // Or maybe a specific "payment_rejected" status? 
                // Creating a custom status might be hard due to Enum.
                // Let's use 'awaiting_payment' again.
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: "awaiting_payment" }
                });
            }
        });

        // Log the action
        await createSystemLog({
            action: action === "verify" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
            entityId: orderId,
            entityType: 'Order',
            details: action === "reject" ? `Payment rejected. Reason: ${rejectionReason}` : "Payment verified and order accepted",
            userId: adminId,
        });

        revalidateOrders();
        return { success: true };
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return { error: error.message || "Failed to verify payment" };
    }
}
