"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./auth-context";
import {
    getUserWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    removeItemFromWishlistByProductId,
    clearUserWishlist,
    mergeGuestWishlist,
    WishlistItemData,
} from "@/app/wishlist/wishlist-actions";

export interface WishlistItem {
    id: string; // For DB items, this is the wishlistItemId; for local items, this is productId
    productId?: string; // The actual product ID (used for DB items)
    name: string;
    price: number;
    image: string;
    category?: string;
    subcategory?: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    removeByProductId: (productId: string) => void;
    clearWishlist: () => void;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
    wishlistCount: number;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const previousUserRef = useRef<string | null>(null);

    // Load wishlist from localStorage (for guests)
    const loadLocalWishlist = useCallback((): WishlistItem[] => {
        if (typeof window === "undefined") return [];
        const savedWishlist = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedWishlist) {
            try {
                return JSON.parse(savedWishlist);
            } catch (e) {
                console.error("Failed to parse wishlist from local storage", e);
            }
        }
        return [];
    }, []);

    // Save wishlist to localStorage (for guests)
    const saveLocalWishlist = useCallback((wishlistItems: WishlistItem[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(wishlistItems));
    }, []);

    // Clear localStorage wishlist
    const clearLocalWishlist = useCallback(() => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }, []);

    // Load wishlist from database (for logged-in users)
    const loadDatabaseWishlist = useCallback(async (userId: string): Promise<WishlistItem[]> => {
        try {
            const dbItems = await getUserWishlist(userId);
            return dbItems.map((item) => ({
                id: item.id, // WishlistItem ID from database
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image || "",
                category: item.category || undefined,
                subcategory: item.subcategory || undefined,
            }));
        } catch (error) {
            console.error("Error loading wishlist from database:", error);
            return [];
        }
    }, []);

    // Initialize wishlist based on auth state
    useEffect(() => {
        const initializeWishlist = async () => {
            if (authLoading) return;

            setIsLoading(true);
            const previousUserId = previousUserRef.current;
            const currentUserId = user?.id || null;

            // User just logged in
            if (currentUserId && !previousUserId) {
                // Get local wishlist before clearing
                const localItems = loadLocalWishlist();

                // Merge local wishlist with database wishlist if there are local items
                if (localItems.length > 0) {
                    const mergeItems: WishlistItemData[] = localItems.map((item) => ({
                        id: item.productId || item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        category: item.category,
                        subcategory: item.subcategory,
                    }));
                    await mergeGuestWishlist(currentUserId, mergeItems);
                    clearLocalWishlist();
                }

                // Load wishlist from database
                const dbItems = await loadDatabaseWishlist(currentUserId);
                setItems(dbItems);
            }
            // User just logged out
            else if (!currentUserId && previousUserId) {
                // Load wishlist from localStorage (guest mode)
                const localItems = loadLocalWishlist();
                setItems(localItems);
            }
            // User is logged in (initial load or same user)
            else if (currentUserId) {
                const dbItems = await loadDatabaseWishlist(currentUserId);
                setItems(dbItems);
            }
            // Guest (initial load or still guest)
            else {
                const localItems = loadLocalWishlist();
                setItems(localItems);
            }

            previousUserRef.current = currentUserId;
            setIsLoading(false);
            setIsInitialized(true);
        };

        initializeWishlist();
    }, [user?.id, authLoading, loadLocalWishlist, clearLocalWishlist, loadDatabaseWishlist]);

    // Save to localStorage when items change (guests only)
    useEffect(() => {
        if (!isInitialized || authLoading) return;
        if (!user) {
            saveLocalWishlist(items);
        }
    }, [items, user, isInitialized, authLoading, saveLocalWishlist]);

    const addItem = useCallback(
        async (newItem: WishlistItem) => {
            // Check if already in wishlist
            const productId = newItem.productId || newItem.id;
            const exists = items.some(
                (item) => (item.productId || item.id) === productId
            );
            if (exists) return;

            if (user) {
                // Logged in - add to database
                const itemData: WishlistItemData = {
                    id: productId,
                    name: newItem.name,
                    price: newItem.price,
                    image: newItem.image,
                    category: newItem.category,
                    subcategory: newItem.subcategory,
                };
                const result = await addItemToWishlist(user.id, itemData);
                if (result.success) {
                    // Reload wishlist from database
                    const dbItems = await loadDatabaseWishlist(user.id);
                    setItems(dbItems);
                }
            } else {
                // Guest - update local state
                setItems((prevItems) => [...prevItems, newItem]);
            }
        },
        [user, items, loadDatabaseWishlist]
    );

    const removeItem = useCallback(
        async (id: string) => {
            if (user) {
                // Logged in - remove from database
                const result = await removeItemFromWishlist(user.id, id);
                if (result.success) {
                    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
                }
            } else {
                // Guest - update local state
                setItems((prevItems) => prevItems.filter((item) => item.id !== id));
            }
        },
        [user]
    );

    const removeByProductId = useCallback(
        async (productId: string) => {
            if (user) {
                // Logged in - remove from database by product ID
                const result = await removeItemFromWishlistByProductId(user.id, productId);
                if (result.success) {
                    setItems((prevItems) =>
                        prevItems.filter((item) => (item.productId || item.id) !== productId)
                    );
                }
            } else {
                // Guest - update local state
                setItems((prevItems) =>
                    prevItems.filter((item) => (item.productId || item.id) !== productId)
                );
            }
        },
        [user]
    );

    const clearWishlist = useCallback(async () => {
        if (user) {
            // Logged in - clear from database
            const result = await clearUserWishlist(user.id);
            if (result.success) {
                setItems([]);
            }
        } else {
            // Guest - clear local state
            setItems([]);
        }
    }, [user]);

    const isInWishlist = useCallback(
        (productId: string) => {
            return items.some((item) => (item.productId || item.id) === productId);
        },
        [items]
    );

    const toggleWishlist = useCallback(
        async (item: WishlistItem) => {
            const productId = item.productId || item.id;
            if (isInWishlist(productId)) {
                // Find the item to remove
                const existingItem = items.find(
                    (i) => (i.productId || i.id) === productId
                );
                if (existingItem) {
                    if (user) {
                        await removeByProductId(productId);
                    } else {
                        await removeItem(existingItem.id);
                    }
                }
            } else {
                await addItem(item);
            }
        },
        [isInWishlist, items, user, addItem, removeItem, removeByProductId]
    );

    const wishlistCount = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                removeByProductId,
                clearWishlist,
                isInWishlist,
                toggleWishlist,
                wishlistCount,
                isLoading,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}

