"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface CreateOrderParams {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    items: string[]; // List of CartItem IDs selected for checkout
}

export async function createOrder(params: CreateOrderParams) {
    const { userId, customerName, customerPhone, customerEmail, items } = params;

    try {
        // 1. Fetch selected cart items
        const cartItems = await prisma.cartItem.findMany({
            where: {
                id: { in: items },
                cart: { userId }
            },
            include: {
                cart: true
            }
        });

        if (cartItems.length === 0) {
            return { success: false, error: "No items selected" };
        }

        // 2. Calculate Total
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (Number(item.price) * item.quantity);
        }, 0);

        // 3. Create Order
        // We link products.
        // We will create OrderItems.

        const order = await prisma.order.create({
            data: {
                userId,
                customerName,
                customerPhone,
                customerEmail,
                totalAmount,
                status: "awaiting_payment",
                items: {
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                },
                payment: {
                    create: {
                        amount: totalAmount,
                        status: "pending",
                        proofImageUrl: "", // To be updated
                    }
                }
            }
        });

        // 4. Remove items from Cart (only the ones ordered)
        await prisma.cartItem.deleteMany({
            where: {
                id: { in: items }
            }
        });

        revalidatePath("/cart");
        revalidatePath("/orders");

        return { success: true, orderId: order.id, amount: totalAmount };

    } catch (error) {
        console.error("Create Order Error:", error);
        return { success: false, error: "Failed to create order" };
    }
}
