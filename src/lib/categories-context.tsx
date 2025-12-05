"use client";

import { createContext, useContext, ReactNode } from "react";

export interface NavCategory {
    id: string;
    name: string;
    slug: string;
    image: string | null;
}

interface CategoriesContextType {
    categories: NavCategory[];
}

const CategoriesContext = createContext<CategoriesContextType>({ categories: [] });

export function CategoriesProvider({
    children,
    categories,
}: {
    children: ReactNode;
    categories: NavCategory[];
}) {
    return (
        <CategoriesContext.Provider value={{ categories }}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    return useContext(CategoriesContext);
}

