"use server";

import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper to revalidate all product-related caches
function revalidateProducts() {
    revalidatePath("/admin/products");
    revalidatePath("/"); // Home page showcases
    revalidatePath("/category", "layout"); // All category pages
}

export async function uploadProductImage(formData: FormData) {
    const supabase = getSupabaseAdmin();
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "No file uploaded" };
    }

    // Generate unique filename with timestamp to prevent collisions
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return { url: data.publicUrl };
}

interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    stock: number;
    images: string[];
    variants: { name: string; size: string; color: string; stock: number; imageUrl?: string }[];
}

export async function createProduct(data: CreateProductData) {
    try {
        // Use transaction to ensure all-or-nothing creation
        await prisma.$transaction(async (tx) => {
            // 1. Handle Category (Find or Create)
            let category = await tx.category.findUnique({
                where: { name: data.category },
            });

            if (!category) {
                // Generate slug for category
                const categorySlug = data.category.toLowerCase().replace(/ /g, "-");
                category = await tx.category.create({
                    data: {
                        name: data.category,
                        slug: categorySlug,
                    },
                });
            }

            // 2. Create Product with Relations
            // Use timestamp + random for unique slug to prevent collisions with concurrent admins
            const timestamp = Date.now();
            const productSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + timestamp.toString(36);

            await tx.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    slug: productSlug,
                    category: { connect: { id: category.id } },
                    subcategory: data.subcategory,
                    images: {
                        create: data.images.map((url) => ({
                            url: url,
                        })),
                    },
                    variants: {
                        create: data.variants.map((variant) => ({
                            name: variant.name,
                            size: variant.size,
                            color: variant.color,
                            stock: variant.stock,
                            imageUrl: variant.imageUrl,
                        })),
                    },
                },
            });
        });

        revalidateProducts();
        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        // Check for unique constraint violation
        if (error.code === 'P2002') {
            return { error: "A product with this name already exists. Please use a different name." };
        }
        return { error: error.message || "Failed to create product" };
    }
}

export async function updateProduct(id: string, data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    subcategory?: string;
    images: string[];
    variants?: { name?: string; size: string; color?: string; stock: number; imageUrl?: string }[];
}) {
    try {
        // Use transaction for atomic updates
        await prisma.$transaction(async (tx) => {
            // 1. Verify product still exists (optimistic locking)
            const existingProduct = await tx.product.findUnique({
                where: { id },
                select: { id: true },
            });
            
            if (!existingProduct) {
                throw new Error("Product not found. It may have been deleted by another admin.");
            }

            // 2. Find or create category
            const category = await tx.category.upsert({
                where: { name: data.category },
                update: {},
                create: { name: data.category, slug: data.category.toLowerCase().replace(/ /g, "-") },
            });

            // 3. Update Product
            await tx.product.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    category: { connect: { id: category.id } },
                    subcategory: data.subcategory,
                },
            });

            // 4. Update Images (Delete all and recreate)
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map((url) => ({
                        productId: id,
                        url: url,
                    })),
                });
            }

            // 5. Handle Variants
            if (data.variants) {
                await tx.productVariant.deleteMany({
                    where: { productId: id },
                });

                if (data.variants.length > 0) {
                    await tx.productVariant.createMany({
                        data: data.variants.map((v) => ({
                            productId: id,
                            name: v.name,
                            size: v.size,
                            color: v.color,
                            stock: v.stock,
                            imageUrl: v.imageUrl,
                        })),
                    });
                }
            }
        });

        revalidateProducts();
        // Also revalidate the specific product page
        revalidatePath(`/product/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: error.message || "Failed to update product" };
    }
}

export async function getProducts(page = 1, pageSize = 20, filters?: { category?: string[], minPrice?: number, maxPrice?: number }) {
    try {
        const where: any = {};

        if (filters?.category && filters.category.length > 0) {
            where.category = {
                name: { in: filters.category }
            };
        }

        if (filters?.minPrice !== undefined) {
            where.price = { gte: filters.minPrice };
        }

        if (filters?.maxPrice !== undefined) {
            where.price = { ...where.price, lte: filters.maxPrice };
        }

        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    images: true,
                    variants: true,
                    category: true,
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: "desc" },
            }),
            prisma.product.count({ where }),
        ]);

        // Transform to match Product interface
        const transformedProducts = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            image: p.images[0]?.url || "",
            images: p.images.map((img: any) => img.url),
            category: p.category.name,
            subcategory: p.subcategory || undefined,
            stock: p.stock,
            variants: p.variants.map((v: any) => ({
                name: v.name || undefined,
                size: v.size,
                color: v.color || undefined,
                stock: v.stock,
                imageUrl: v.imageUrl || undefined
            })),
            isNew: (new Date().getTime() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 // New if created within 7 days
        }));

        return { products: transformedProducts, count };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [], count: 0 };
    }
}

export async function getProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                variants: true,
                category: true,
            },
        });

        if (!product) return null;

        return {
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: Number(product.price),
            image: product.images[0]?.url || "",
            images: product.images.map((img: any) => img.url),
            category: product.category.name,
            subcategory: product.subcategory || undefined,
            stock: product.stock,
            variants: product.variants.map((v: any) => ({
                name: v.name || undefined,
                size: v.size,
                color: v.color || undefined,
                stock: v.stock,
                imageUrl: v.imageUrl || undefined
            })),
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// Delete product with proper cleanup
export async function deleteProduct(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Check if product exists
            const product = await tx.product.findUnique({
                where: { id },
                include: { images: true },
            });
            
            if (!product) {
                throw new Error("Product not found. It may have already been deleted.");
            }

            // Delete product (cascades to images and variants due to schema)
            await tx.product.delete({
                where: { id },
            });
        });

        revalidateProducts();
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { error: error.message || "Failed to delete product" };
    }
}

// Bulk delete products
export async function deleteProducts(ids: string[]) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.product.deleteMany({
                where: { id: { in: ids } },
            });
        });

        revalidateProducts();
        return { success: true, deleted: ids.length };
    } catch (error: any) {
        console.error("Error deleting products:", error);
        return { error: error.message || "Failed to delete products" };
    }
}

// Get all categories for filters
export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            select: { name: true },
            orderBy: { name: "asc" },
        });
        return categories.map(c => c.name);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
