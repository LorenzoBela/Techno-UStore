"use server";

import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function uploadProductImage(formData: FormData) {
    const supabase = getSupabaseAdmin();
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "No file uploaded" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
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
    stock: number;
    images: string[];
    variants: { name: string; size: string; color: string; stock: number; imageUrl?: string }[];
}

export async function createProduct(data: CreateProductData) {
    try {
        // 1. Handle Category (Find or Create)
        let category = await prisma.category.findUnique({
            where: { name: data.category },
        });

        if (!category) {
            // Generate slug for category
            const categorySlug = data.category.toLowerCase().replace(/ /g, "-");
            category = await prisma.category.create({
                data: {
                    name: data.category,
                    slug: categorySlug,
                },
            });
        }

        // 2. Create Product with Relations
        const productSlug = data.name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7);

        await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                slug: productSlug,
                categoryId: category.id,
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

        revalidatePath("/admin/products");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { error: error.message || "Failed to create product" };
    }
}

export async function updateProduct(id: string, data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    variants?: { name?: string; size: string; color?: string; stock: number; imageUrl?: string }[];
}) {
    try {
        // 1. Find or create category
        const category = await prisma.category.upsert({
            where: { name: data.category },
            update: {},
            create: { name: data.category, slug: data.category.toLowerCase().replace(/ /g, "-") },
        });

        // 2. Update Product
        await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                categoryId: category.id,
            },
        });

        // 3. Update Images (Delete all and recreate)
        await prisma.productImage.deleteMany({ where: { productId: id } });
        if (data.images.length > 0) {
            await prisma.productImage.createMany({
                data: data.images.map((url) => ({
                    productId: id,
                    url: url,
                })),
            });
        }

        // 4. Handle Variants
        if (data.variants) {
            // Delete existing variants
            await prisma.productVariant.deleteMany({
                where: { productId: id },
            });

            // Create new variants
            if (data.variants.length > 0) {
                await prisma.productVariant.createMany({
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

        revalidatePath("/admin/products");
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
