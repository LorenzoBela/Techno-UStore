"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CartItemData {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
    category?: string;
    subcategory?: string;
}

export interface CartItemFromDB {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string | null;
    quantity: number;
    size: string | null;
    color: string | null;
    category: string | null;
    subcategory: string | null;
}

// Get or create a cart for a user
async function getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: { items: true },
        });
    }

    return cart;
}

// Get user's cart with all items
export async function getUserCart(userId: string): Promise<CartItemFromDB[]> {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!cart) {
            return [];
        }

        return cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            category: item.category,
            subcategory: item.subcategory,
        }));
    } catch (error) {
        console.error("Error getting user cart:", error);
        return [];
    }
}

// Add an item to user's cart
export async function addItemToCart(
    userId: string,
    item: CartItemData
): Promise<{ success: boolean; error?: string }> {
    try {
        const cart = await getOrCreateCart(userId);

        // Check if item with same product, size, and color already exists
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: item.id,
                size: item.size || null,
                color: item.color || null,
            },
        });

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + item.quantity,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: item.id,
                    name: item.name,
                    price: new Prisma.Decimal(item.price),
                    image: item.image || null,
                    quantity: item.quantity,
                    size: item.size || null,
                    color: item.color || null,
                    category: item.category || null,
                    subcategory: item.subcategory || null,
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding item to cart:", error);
        return { success: false, error: "Failed to add item to cart" };
    }
}

// Remove an item from cart
export async function removeItemFromCart(
    userId: string,
    cartItemId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return { success: false, error: "Cart not found" };
        }

        await prisma.cartItem.delete({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing item from cart:", error);
        return { success: false, error: "Failed to remove item from cart" };
    }
}

// Update item quantity
export async function updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
): Promise<{ success: boolean; error?: string }> {
    try {
        if (quantity <= 0) {
            return removeItemFromCart(userId, cartItemId);
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return { success: false, error: "Cart not found" };
        }

        await prisma.cartItem.update({
            where: {
                id: cartItemId,
                cartId: cart.id,
            },
            data: {
                quantity,
                updatedAt: new Date(),
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating item quantity:", error);
        return { success: false, error: "Failed to update item quantity" };
    }
}

// Clear user's cart
export async function clearUserCart(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            return { success: true }; // No cart to clear
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return { success: true };
    } catch (error) {
        console.error("Error clearing cart:", error);
        return { success: false, error: "Failed to clear cart" };
    }
}

// Merge guest cart (localStorage) with user's database cart
export async function mergeGuestCart(
    userId: string,
    localItems: CartItemData[]
): Promise<{ success: boolean; error?: string }> {
    try {
        if (localItems.length === 0) {
            return { success: true };
        }

        const cart = await getOrCreateCart(userId);

        // Get existing items in the cart
        const existingItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
        });

        // Create a map for quick lookup
        const existingItemsMap = new Map(
            existingItems.map((item) => [
                `${item.productId}-${item.size || ""}-${item.color || ""}`,
                item,
            ])
        );

        // Process each local item
        for (const localItem of localItems) {
            const key = `${localItem.id}-${localItem.size || ""}-${localItem.color || ""}`;
            const existingItem = existingItemsMap.get(key);

            if (existingItem) {
                // Item exists - add quantities together
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: existingItem.quantity + localItem.quantity,
                        updatedAt: new Date(),
                    },
                });
            } else {
                // New item - add to cart
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId: localItem.id,
                        name: localItem.name,
                        price: new Prisma.Decimal(localItem.price),
                        image: localItem.image || null,
                        quantity: localItem.quantity,
                        size: localItem.size || null,
                        color: localItem.color || null,
                        category: localItem.category || null,
                        subcategory: localItem.subcategory || null,
                    },
                });
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error merging guest cart:", error);
        return { success: false, error: "Failed to merge cart" };
    }
}

// Sync entire cart state (replace all items)
export async function syncCartToDatabase(
    userId: string,
    items: CartItemData[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const cart = await getOrCreateCart(userId);

        // Delete all existing items
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        // Add all new items
        if (items.length > 0) {
            await prisma.cartItem.createMany({
                data: items.map((item) => ({
                    cartId: cart.id,
                    productId: item.id,
                    name: item.name,
                    price: new Prisma.Decimal(item.price),
                    image: item.image || null,
                    quantity: item.quantity,
                    size: item.size || null,
                    color: item.color || null,
                    category: item.category || null,
                    subcategory: item.subcategory || null,
                })),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error syncing cart to database:", error);
        return { success: false, error: "Failed to sync cart" };
    }
}

