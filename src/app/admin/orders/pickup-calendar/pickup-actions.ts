"use server";

import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export type PickupOrder = {
    id: string;
    customerName: string;
    customerEmail: string;
    scheduledPickupDate: Date | null;
    status: OrderStatus;
    items: {
        productName: string;
        quantity: number;
        variant: string | null;
    }[];
};

export async function getPickupOrders(startDate?: Date, endDate?: Date): Promise<PickupOrder[]> {
    const where: any = {
        scheduledPickupDate: {
            not: null,
        },
    };

    if (startDate && endDate) {
        where.scheduledPickupDate = {
            ...where.scheduledPickupDate,
            gte: startDate,
            lte: endDate,
        };
    }

    const orders = await prisma.order.findMany({
        where,
        select: {
            id: true,
            customerName: true,
            customerEmail: true,
            scheduledPickupDate: true,
            status: true,
            items: {
                select: {
                    product: {
                        select: {
                            name: true,
                        },
                    },
                    quantity: true,
                    // We might not have easy access to variant string if it's not stored directly on OrderItem easily,
                    // but let's check schema. OrderItem rels to Product.
                    // Schema has `CartItem` with size/color/subcategory, but `OrderItem` only has `productId`.
                    // Wait, `OrderItem` in schema:
                    // model OrderItem { ... productId, quantity, price }
                    // It seems specific variant details (size/color) are MISSING from OrderItem in schema 
                    // based on my previous read of schema.prisma lines 178-190. 
                    // Wait, let me double check schema lines 178-190.
                    // Yes, `OrderItem` in the viewed schema ONLY has productId, quantity, price.
                    // It does NOT have size/color snapshot! This might be a data loss issue for the user generally,
                    // but for this specific task I will just list the Product Name.
                },
            },
        },
        orderBy: {
            scheduledPickupDate: "asc",
        },
    });

    return orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        scheduledPickupDate: order.scheduledPickupDate,
        status: order.status,
        items: order.items.map((item) => ({
            productName: item.product.name,
            quantity: item.quantity,
            variant: null, // Placeholder as schema doesn't seem to store this on OrderItem yet?
        })),
    }));
}
