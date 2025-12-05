"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

// Types for the categories management
export interface CategoryWithSubcategories {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
    productCount: number;
    subcategories: {
        id: string;
        name: string;
        slug: string;
        productCount: number;
    }[];
}

export interface SubcategoryData {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    categoryName: string;
    productCount: number;
}

// Helper to revalidate all category-related caches
function revalidateCategories() {
    revalidatePath("/admin/products/categories");
    revalidatePath("/admin/products");
    revalidatePath("/"); // Home page
    revalidatePath("/category", "layout"); // All category pages
    revalidateTag("categories");
}

// Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

// ============ CATEGORY OPERATIONS ============

// Get all categories with subcategories and product counts
export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
                subcategories: {
                    include: {
                        _count: {
                            select: { products: true },
                        },
                    },
                    orderBy: { name: "asc" },
                },
            },
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        });

        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            displayOrder: cat.displayOrder,
            isActive: cat.isActive,
            productCount: cat._count.products,
            subcategories: cat.subcategories.map((sub) => ({
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                productCount: sub._count.products,
            })),
        }));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Get active categories for navbar
export async function getActiveCategories(): Promise<{ id: string; name: string; slug: string; image: string | null }[]> {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
            },
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        });
        return categories;
    } catch (error) {
        console.error("Error fetching active categories:", error);
        return [];
    }
}

// Get subcategories for a category (for product form)
export async function getSubcategoriesByCategory(categoryId: string): Promise<{ id: string; name: string; slug: string }[]> {
    try {
        const subcategories = await prisma.subcategory.findMany({
            where: { categoryId },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: { name: "asc" },
        });
        return subcategories;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return [];
    }
}

// Get subcategories by category name (for backward compatibility)
export async function getSubcategoriesByCategoryName(categoryName: string): Promise<{ id: string; name: string; slug: string }[]> {
    try {
        const category = await prisma.category.findUnique({
            where: { name: categoryName },
            select: { id: true },
        });
        
        if (!category) return [];
        
        return getSubcategoriesByCategory(category.id);
    } catch (error) {
        console.error("Error fetching subcategories by name:", error);
        return [];
    }
}

// Create a new category
export async function createCategory(data: {
    name: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}): Promise<{ success?: boolean; error?: string; category?: { id: string; name: string; slug: string } }> {
    try {
        const slug = generateSlug(data.name);

        // Check if slug already exists
        const existing = await prisma.category.findUnique({
            where: { slug },
        });

        if (existing) {
            return { error: "A category with this name already exists" };
        }

        // Get max displayOrder
        const maxOrder = await prisma.category.aggregate({
            _max: { displayOrder: true },
        });

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                isActive: data.isActive ?? true,
                displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
            },
        });

        revalidateCategories();
        return { success: true, category: { id: category.id, name: category.name, slug: category.slug } };
    } catch (error: any) {
        console.error("Error creating category:", error);
        if (error.code === "P2002") {
            return { error: "A category with this name already exists" };
        }
        return { error: error.message || "Failed to create category" };
    }
}

// Update a category
export async function updateCategory(
    id: string,
    data: {
        name?: string;
        description?: string;
        image?: string;
        isActive?: boolean;
        displayOrder?: number;
    }
): Promise<{ success?: boolean; error?: string }> {
    try {
        const updateData: any = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
            updateData.slug = generateSlug(data.name);
        }
        if (data.description !== undefined) updateData.description = data.description;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

        await prisma.category.update({
            where: { id },
            data: updateData,
        });

        revalidateCategories();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating category:", error);
        if (error.code === "P2002") {
            return { error: "A category with this name already exists" };
        }
        return { error: error.message || "Failed to update category" };
    }
}

// Delete a category
export async function deleteCategory(id: string): Promise<{ success?: boolean; error?: string }> {
    try {
        // Check if category has products
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: { select: { products: true } },
            },
        });

        if (!category) {
            return { error: "Category not found" };
        }

        if (category._count.products > 0) {
            return { 
                error: `Cannot delete category "${category.name}" because it has ${category._count.products} products. Please move or delete the products first.` 
            };
        }

        // Delete will cascade to subcategories
        await prisma.category.delete({
            where: { id },
        });

        revalidateCategories();
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return { error: error.message || "Failed to delete category" };
    }
}

// Reorder categories
export async function reorderCategories(categoryOrders: { id: string; displayOrder: number }[]): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.$transaction(
            categoryOrders.map((cat) =>
                prisma.category.update({
                    where: { id: cat.id },
                    data: { displayOrder: cat.displayOrder },
                })
            )
        );

        revalidateCategories();
        return { success: true };
    } catch (error: any) {
        console.error("Error reordering categories:", error);
        return { error: error.message || "Failed to reorder categories" };
    }
}

// ============ SUBCATEGORY OPERATIONS ============

// Create a new subcategory
export async function createSubcategory(data: {
    name: string;
    categoryId: string;
}): Promise<{ success?: boolean; error?: string; subcategory?: { id: string; name: string; slug: string } }> {
    try {
        const slug = generateSlug(data.name);

        // Check if slug already exists for this category
        const existing = await prisma.subcategory.findUnique({
            where: {
                categoryId_slug: {
                    categoryId: data.categoryId,
                    slug,
                },
            },
        });

        if (existing) {
            return { error: "A subcategory with this name already exists in this category" };
        }

        const subcategory = await prisma.subcategory.create({
            data: {
                name: data.name,
                slug,
                categoryId: data.categoryId,
            },
        });

        revalidateCategories();
        return { success: true, subcategory: { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } };
    } catch (error: any) {
        console.error("Error creating subcategory:", error);
        if (error.code === "P2002") {
            return { error: "A subcategory with this name already exists in this category" };
        }
        return { error: error.message || "Failed to create subcategory" };
    }
}

// Update a subcategory
export async function updateSubcategory(
    id: string,
    data: { name?: string }
): Promise<{ success?: boolean; error?: string }> {
    try {
        const updateData: any = {};

        if (data.name !== undefined) {
            updateData.name = data.name;
            updateData.slug = generateSlug(data.name);
        }

        await prisma.subcategory.update({
            where: { id },
            data: updateData,
        });

        revalidateCategories();
        return { success: true };
    } catch (error: any) {
        console.error("Error updating subcategory:", error);
        if (error.code === "P2002") {
            return { error: "A subcategory with this name already exists in this category" };
        }
        return { error: error.message || "Failed to update subcategory" };
    }
}

// Delete a subcategory
export async function deleteSubcategory(id: string): Promise<{ success?: boolean; error?: string }> {
    try {
        // Check if subcategory has products
        const subcategory = await prisma.subcategory.findUnique({
            where: { id },
            include: {
                _count: { select: { products: true } },
            },
        });

        if (!subcategory) {
            return { error: "Subcategory not found" };
        }

        if (subcategory._count.products > 0) {
            return { 
                error: `Cannot delete subcategory "${subcategory.name}" because it has ${subcategory._count.products} products. Please move or delete the products first.` 
            };
        }

        await prisma.subcategory.delete({
            where: { id },
        });

        revalidateCategories();
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting subcategory:", error);
        return { error: error.message || "Failed to delete subcategory" };
    }
}

// ============ MIGRATION HELPER ============

// Migrate existing subcategory strings to Subcategory records
export async function migrateSubcategories(): Promise<{ success?: boolean; error?: string; migrated?: number }> {
    try {
        // Get all unique category + subcategory combinations
        const products = await prisma.product.findMany({
            where: {
                subcategory: { not: null },
                subcategoryId: null,
            },
            select: {
                id: true,
                subcategory: true,
                categoryId: true,
            },
        });

        // Group by categoryId + subcategory name
        const uniqueCombos = new Map<string, { categoryId: string; subcategory: string }>();
        for (const product of products) {
            if (product.subcategory) {
                const key = `${product.categoryId}:${product.subcategory}`;
                if (!uniqueCombos.has(key)) {
                    uniqueCombos.set(key, {
                        categoryId: product.categoryId,
                        subcategory: product.subcategory,
                    });
                }
            }
        }

        // Create subcategories and update products
        let migrated = 0;
        for (const [, { categoryId, subcategory }] of uniqueCombos) {
            const slug = generateSlug(subcategory);
            
            // Create or find subcategory
            const sub = await prisma.subcategory.upsert({
                where: {
                    categoryId_slug: { categoryId, slug },
                },
                create: {
                    name: subcategory,
                    slug,
                    categoryId,
                },
                update: {},
            });

            // Update products with this subcategory
            const result = await prisma.product.updateMany({
                where: {
                    categoryId,
                    subcategory,
                    subcategoryId: null,
                },
                data: {
                    subcategoryId: sub.id,
                },
            });

            migrated += result.count;
        }

        revalidateCategories();
        return { success: true, migrated };
    } catch (error: any) {
        console.error("Error migrating subcategories:", error);
        return { error: error.message || "Failed to migrate subcategories" };
    }
}

