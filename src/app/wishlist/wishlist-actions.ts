"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface WishlistItemData {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    subcategory?: string;
}

export interface WishlistItemFromDB {
    id: string;
    productId: string;
    name: string;
    price: number;
    image: string | null;
    category: string | null;
    subcategory: string | null;
    createdAt: Date;
}

// Get or create a wishlist for a user
async function getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: { items: true },
    });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({
            data: { userId },
            include: { items: true },
        });
    }

    return wishlist;
}

// Get user's wishlist with all items
export async function getUserWishlist(userId: string): Promise<WishlistItemFromDB[]> {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!wishlist) {
            return [];
        }

        return wishlist.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            image: item.image,
            category: item.category,
            subcategory: item.subcategory,
            createdAt: item.createdAt,
        }));
    } catch (error) {
        console.error("Error getting user wishlist:", error);
        return [];
    }
}

// Add an item to user's wishlist
export async function addItemToWishlist(
    userId: string,
    item: WishlistItemData
): Promise<{ success: boolean; error?: string }> {
    try {
        const wishlist = await getOrCreateWishlist(userId);

        // Check if item already exists in wishlist
        const existingItem = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: wishlist.id,
                productId: item.id,
            },
        });

        if (existingItem) {
            // Item already in wishlist
            return { success: true };
        }

        // Create new wishlist item
        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId: item.id,
                name: item.name,
                price: new Prisma.Decimal(item.price),
                image: item.image || null,
                category: item.category || null,
                subcategory: item.subcategory || null,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error adding item to wishlist:", error);
        return { success: false, error: "Failed to add item to wishlist" };
    }
}

// Remove an item from wishlist
export async function removeItemFromWishlist(
    userId: string,
    wishlistItemId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
        });

        if (!wishlist) {
            return { success: false, error: "Wishlist not found" };
        }

        await prisma.wishlistItem.delete({
            where: {
                id: wishlistItemId,
                wishlistId: wishlist.id,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing item from wishlist:", error);
        return { success: false, error: "Failed to remove item from wishlist" };
    }
}

// Remove item from wishlist by product ID
export async function removeItemFromWishlistByProductId(
    userId: string,
    productId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
        });

        if (!wishlist) {
            return { success: false, error: "Wishlist not found" };
        }

        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId: productId,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing item from wishlist:", error);
        return { success: false, error: "Failed to remove item from wishlist" };
    }
}

// Clear user's wishlist
export async function clearUserWishlist(
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
        });

        if (!wishlist) {
            return { success: true }; // No wishlist to clear
        }

        await prisma.wishlistItem.deleteMany({
            where: { wishlistId: wishlist.id },
        });

        return { success: true };
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        return { success: false, error: "Failed to clear wishlist" };
    }
}

// Check if a product is in the user's wishlist
export async function isProductInWishlist(
    userId: string,
    productId: string
): Promise<boolean> {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    where: { productId },
                },
            },
        });

        return wishlist ? wishlist.items.length > 0 : false;
    } catch (error) {
        console.error("Error checking wishlist:", error);
        return false;
    }
}

// Merge guest wishlist (localStorage) with user's database wishlist
export async function mergeGuestWishlist(
    userId: string,
    localItems: WishlistItemData[]
): Promise<{ success: boolean; error?: string }> {
    try {
        if (localItems.length === 0) {
            return { success: true };
        }

        const wishlist = await getOrCreateWishlist(userId);

        // Get existing items in the wishlist
        const existingItems = await prisma.wishlistItem.findMany({
            where: { wishlistId: wishlist.id },
        });

        // Create a set of existing product IDs
        const existingProductIds = new Set(existingItems.map((item) => item.productId));

        // Filter out items that already exist
        const newItems = localItems.filter((item) => !existingProductIds.has(item.id));

        // Add new items
        if (newItems.length > 0) {
            await prisma.wishlistItem.createMany({
                data: newItems.map((item) => ({
                    wishlistId: wishlist.id,
                    productId: item.id,
                    name: item.name,
                    price: new Prisma.Decimal(item.price),
                    image: item.image || null,
                    category: item.category || null,
                    subcategory: item.subcategory || null,
                })),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error merging guest wishlist:", error);
        return { success: false, error: "Failed to merge wishlist" };
    }
}

