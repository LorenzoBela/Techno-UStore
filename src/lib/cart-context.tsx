"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./auth-context";
import {
    getUserCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearUserCart,
    mergeGuestCart,
    CartItemData,
} from "@/app/cart/cart-actions";

export interface CartItem {
    id: string; // For DB items, this is the cartItemId; for local items, this is productId
    productId?: string; // The actual product ID (used for DB items)
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    category?: string;
    subcategory?: string;
    color?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    isLoading: boolean;
    // Selection for checkout
    selectedItems: Set<string>;
    toggleItemSelection: (id: string) => void;
    selectAllItems: () => void;
    deselectAllItems: () => void;
    getSelectedCartItems: () => CartItem[];
    selectedCount: number;
    selectedTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "cart";
const SELECTION_STORAGE_KEY = "cart_selection";

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading: authLoading } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const previousUserRef = useRef<string | null>(null);
    
    // Selection state for checkout
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // Load cart from localStorage (for guests)
    const loadLocalCart = useCallback((): CartItem[] => {
        if (typeof window === "undefined") return [];
        const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
            }
        }
        return [];
    }, []);

    // Save cart to localStorage (for guests)
    const saveLocalCart = useCallback((cartItems: CartItem[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }, []);

    // Clear localStorage cart
    const clearLocalCart = useCallback(() => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }, []);

    // Load selection from localStorage
    const loadSelection = useCallback((): Set<string> => {
        if (typeof window === "undefined") return new Set();
        const savedSelection = localStorage.getItem(SELECTION_STORAGE_KEY);
        if (savedSelection) {
            try {
                return new Set(JSON.parse(savedSelection));
            } catch (e) {
                console.error("Failed to parse selection from local storage", e);
            }
        }
        return new Set();
    }, []);

    // Save selection to localStorage
    const saveSelection = useCallback((selection: Set<string>) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify([...selection]));
    }, []);

    // Load cart from database (for logged-in users)
    const loadDatabaseCart = useCallback(async (userId: string): Promise<CartItem[]> => {
        try {
            const dbItems = await getUserCart(userId);
            return dbItems.map((item) => ({
                id: item.id, // CartItem ID from database
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image || "",
                quantity: item.quantity,
                size: item.size || undefined,
                color: item.color || undefined,
                category: item.category || undefined,
                subcategory: item.subcategory || undefined,
            }));
        } catch (error) {
            console.error("Error loading cart from database:", error);
            return [];
        }
    }, []);

    // Initialize cart based on auth state
    useEffect(() => {
        const initializeCart = async () => {
            if (authLoading) return;

            setIsLoading(true);
            const previousUserId = previousUserRef.current;
            const currentUserId = user?.id || null;

            // User just logged in
            if (currentUserId && !previousUserId) {
                // Get local cart before clearing
                const localItems = loadLocalCart();

                // Merge local cart with database cart if there are local items
                if (localItems.length > 0) {
                    const mergeItems: CartItemData[] = localItems.map((item) => ({
                        id: item.productId || item.id, // Use productId if available, otherwise id
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color,
                        category: item.category,
                        subcategory: item.subcategory,
                    }));
                    await mergeGuestCart(currentUserId, mergeItems);
                    clearLocalCart();
                }

                // Load cart from database
                const dbItems = await loadDatabaseCart(currentUserId);
                setItems(dbItems);
                // Select all items by default when loading
                setSelectedItems(new Set(dbItems.map(item => item.id)));
            }
            // User just logged out
            else if (!currentUserId && previousUserId) {
                // Load cart from localStorage (guest mode)
                const localItems = loadLocalCart();
                setItems(localItems);
                // Load saved selection or select all
                const savedSelection = loadSelection();
                if (savedSelection.size > 0) {
                    setSelectedItems(savedSelection);
                } else {
                    setSelectedItems(new Set(localItems.map(item => item.id)));
                }
            }
            // User is logged in (initial load or same user)
            else if (currentUserId) {
                const dbItems = await loadDatabaseCart(currentUserId);
                setItems(dbItems);
                // Load saved selection or select all
                const savedSelection = loadSelection();
                if (savedSelection.size > 0) {
                    // Filter to only include items that still exist
                    const validSelection = new Set([...savedSelection].filter(id => 
                        dbItems.some(item => item.id === id)
                    ));
                    setSelectedItems(validSelection.size > 0 ? validSelection : new Set(dbItems.map(item => item.id)));
                } else {
                    setSelectedItems(new Set(dbItems.map(item => item.id)));
                }
            }
            // Guest (initial load or still guest)
            else {
                const localItems = loadLocalCart();
                setItems(localItems);
                // Load saved selection or select all
                const savedSelection = loadSelection();
                if (savedSelection.size > 0) {
                    // Filter to only include items that still exist
                    const validSelection = new Set([...savedSelection].filter(id => 
                        localItems.some(item => item.id === id)
                    ));
                    setSelectedItems(validSelection.size > 0 ? validSelection : new Set(localItems.map(item => item.id)));
                } else {
                    setSelectedItems(new Set(localItems.map(item => item.id)));
                }
            }

            previousUserRef.current = currentUserId;
            setIsLoading(false);
            setIsInitialized(true);
        };

        initializeCart();
    }, [user?.id, authLoading, loadLocalCart, clearLocalCart, loadDatabaseCart, loadSelection]);

    // Save to localStorage when items change (guests only)
    useEffect(() => {
        if (!isInitialized || authLoading) return;
        if (!user) {
            saveLocalCart(items);
        }
    }, [items, user, isInitialized, authLoading, saveLocalCart]);

    // Save selection to localStorage when it changes
    useEffect(() => {
        if (!isInitialized) return;
        saveSelection(selectedItems);
    }, [selectedItems, isInitialized, saveSelection]);

    const addItem = useCallback(
        async (newItem: CartItem) => {
            if (user) {
                // Logged in - add to database
                const itemData: CartItemData = {
                    id: newItem.productId || newItem.id,
                    name: newItem.name,
                    price: newItem.price,
                    image: newItem.image,
                    quantity: newItem.quantity,
                    size: newItem.size,
                    color: newItem.color,
                    category: newItem.category,
                    subcategory: newItem.subcategory,
                };
                const result = await addItemToCart(user.id, itemData);
                if (result.success) {
                    // Reload cart from database
                    const dbItems = await loadDatabaseCart(user.id);
                    setItems(dbItems);
                    // Auto-select newly added items
                    const newItemIds = dbItems.map(item => item.id);
                    setSelectedItems(prev => {
                        const newSet = new Set(prev);
                        newItemIds.forEach(id => newSet.add(id));
                        return newSet;
                    });
                }
            } else {
                // Guest - update local state
                setItems((prevItems) => {
                    const existingItemIndex = prevItems.findIndex(
                        (item) =>
                            (item.productId || item.id) === (newItem.productId || newItem.id) &&
                            item.size === newItem.size &&
                            item.color === newItem.color
                    );

                    if (existingItemIndex > -1) {
                        const newItems = [...prevItems];
                        newItems[existingItemIndex].quantity += newItem.quantity;
                        return newItems;
                    } else {
                        // Auto-select new item
                        setSelectedItems(prev => new Set(prev).add(newItem.id));
                        return [...prevItems, newItem];
                    }
                });
            }
        },
        [user, loadDatabaseCart]
    );

    const removeItem = useCallback(
        async (id: string) => {
            if (user) {
                // Logged in - remove from database
                const result = await removeItemFromCart(user.id, id);
                if (result.success) {
                    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
                    // Remove from selection
                    setSelectedItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                }
            } else {
                // Guest - update local state
                setItems((prevItems) => prevItems.filter((item) => item.id !== id));
                // Remove from selection
                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }
        },
        [user]
    );

    const updateQuantity = useCallback(
        async (id: string, quantity: number) => {
            if (quantity <= 0) {
                return removeItem(id);
            }

            if (user) {
                // Logged in - update in database
                const result = await updateItemQuantity(user.id, id, quantity);
                if (result.success) {
                    setItems((prevItems) =>
                        prevItems.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        )
                    );
                }
            } else {
                // Guest - update local state
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
                    )
                );
            }
        },
        [user, removeItem]
    );

    const clearCart = useCallback(async () => {
        if (user) {
            // Logged in - clear from database
            const result = await clearUserCart(user.id);
            if (result.success) {
                setItems([]);
                setSelectedItems(new Set());
            }
        } else {
            // Guest - clear local state
            setItems([]);
            setSelectedItems(new Set());
        }
    }, [user]);

    // Selection functions
    const toggleItemSelection = useCallback((id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAllItems = useCallback(() => {
        setSelectedItems(new Set(items.map(item => item.id)));
    }, [items]);

    const deselectAllItems = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    const getSelectedCartItems = useCallback(() => {
        return items.filter(item => selectedItems.has(item.id));
    }, [items, selectedItems]);

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);
    const selectedCount = items.filter(item => selectedItems.has(item.id)).reduce((total, item) => total + item.quantity, 0);
    const selectedTotal = items.filter(item => selectedItems.has(item.id)).reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                isLoading,
                selectedItems,
                toggleItemSelection,
                selectAllItems,
                deselectAllItems,
                getSelectedCartItems,
                selectedCount,
                selectedTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
