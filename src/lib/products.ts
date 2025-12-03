import { prisma } from "@/lib/db";
import { Product, ProductVariant, Category } from "@/lib/types";

// Re-export types for convenience
export type { Product, ProductVariant, Category } from "@/lib/types";

// Helper to transform DB product to frontend Product
function transformProduct(dbProduct: {
    id: string;
    name: string;
    description: string | null;
    price: { toNumber: () => number } | number;
    stock: number;
    createdAt: Date;
    category: { name: string };
    images: { url: string }[];
    variants: { name: string | null; size: string; color: string | null; stock: number; imageUrl: string | null }[];
}): Product {
    const now = new Date();
    const createdAt = new Date(dbProduct.createdAt);
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description || undefined,
        price: typeof dbProduct.price === 'number' ? dbProduct.price : dbProduct.price.toNumber(),
        image: dbProduct.images[0]?.url || "",
        images: dbProduct.images.map(img => img.url),
        category: dbProduct.category.name,
        isNew: daysDiff <= 7, // Products created within 7 days are "new"
        stock: dbProduct.stock,
        variants: dbProduct.variants.map(v => ({
            name: v.name || undefined,
            size: v.size,
            color: v.color || undefined,
            stock: v.stock,
            imageUrl: v.imageUrl || undefined,
        })),
    };
}

// Fetch products by category slug
export async function getProductsByCategory(categorySlug: string, limit?: number): Promise<Product[]> {
    const products = await prisma.product.findMany({
        where: {
            category: {
                slug: categorySlug.toLowerCase(),
            },
        },
        include: {
            category: true,
            images: true,
            variants: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return products.map(transformProduct);
}

// Fetch top products for each category (for home page)
export async function getTopProductsByCategory(categorySlug: string, limit: number = 4): Promise<Product[]> {
    return getProductsByCategory(categorySlug, limit);
}

// Fetch all products
export async function getAllProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            images: true,
            variants: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return products.map(transformProduct);
}

// Fetch a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            images: true,
            variants: true,
        },
    });

    if (!product) return null;
    return transformProduct(product);
}

// Fetch all categories
export async function getAllCategories(): Promise<{ name: string; slug: string; count: number }[]> {
    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { products: true },
            },
        },
        orderBy: { name: "asc" },
    });

    return categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        count: cat._count.products,
    }));
}
