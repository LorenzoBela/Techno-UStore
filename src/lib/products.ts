import { prisma } from "@/lib/db";
import { Product, ProductVariant, Category } from "@/lib/types";
import { unstable_cache } from "next/cache";

// Re-export types for convenience
export type { Product, ProductVariant, Category } from "@/lib/types";

// Placeholder image for products without images
const PRODUCT_PLACEHOLDER_IMAGE = "/product-placeholder.png";

// Helper to transform DB product to frontend Product
function transformProduct(dbProduct: {
    id: string;
    name: string;
    description: string | null;
    price: { toNumber: () => number } | number;
    stock: number;
    createdAt: Date;
    category: { name: string };
    subcategory: string | null;
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
        image: dbProduct.images[0]?.url || PRODUCT_PLACEHOLDER_IMAGE,
        images: dbProduct.images.length > 0 ? dbProduct.images.map(img => img.url) : [PRODUCT_PLACEHOLDER_IMAGE],
        category: dbProduct.category.name,
        subcategory: dbProduct.subcategory || undefined,
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

// Fetch products by category slug with filters and pagination
// Optimized for 500+ products per category
export async function getProductsByCategory(
    categorySlug: string,
    filters?: {
        types?: string[];
        priceRange?: string[];
        sizes?: string[];
        sort?: string;
        page?: number;
        limit?: number;
    },
    limit?: number
): Promise<Product[]> {
    try {
        const where: any = {
            isHidden: false, // Don't show hidden products on storefront
            category: {
                slug: categorySlug.toLowerCase(),
            },
        };

        // Filter by Subcategory (Type)
        if (filters?.types && filters.types.length > 0) {
            where.subcategory = { in: filters.types };
        }

        // Filter by Size (uses @@index([productId, size]))
        if (filters?.sizes && filters.sizes.length > 0) {
            where.variants = {
                some: {
                    size: { in: filters.sizes }
                }
            };
        }

        // Filter by Price Range (uses @@index([categoryId, price]))
        if (filters?.priceRange && filters.priceRange.length > 0) {
            const priceConditions = filters.priceRange.map(range => {
                if (range === 'under-500') return { price: { lt: 500 } };
                if (range === '500-1000') return { price: { gte: 500, lte: 1000 } };
                if (range === 'above-1000') return { price: { gt: 1000 } };
                return {};
            });

            if (priceConditions.length > 0) {
                where.AND = [
                    ...(where.AND || []),
                    { OR: priceConditions }
                ];
            }
        }

        // Determine Sort Order (uses appropriate indexes)
        let orderBy: any = { createdAt: "desc" }; // Uses @@index([categoryId, createdAt])
        if (filters?.sort === 'price-asc') orderBy = { price: "asc" }; // Uses @@index([categoryId, price])
        if (filters?.sort === 'price-desc') orderBy = { price: "desc" };
        if (filters?.sort === 'newest') orderBy = { createdAt: "desc" };

        // Pagination for large categories
        const page = filters?.page || 1;
        const pageSize = limit || filters?.limit || 24; // 24 products per page (4x6 grid)
        const skip = (page - 1) * pageSize;

        const products = await prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                subcategory: true,
                createdAt: true,
                category: { select: { name: true } },
                images: { take: 1, select: { url: true } }, // Only first image for grid view
                variants: { select: { name: true, size: true, color: true, stock: true, imageUrl: true } },
            },
            orderBy,
            skip,
            take: pageSize,
        });

        return products.map(transformProduct);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return [];
    }
}

// Cached version for home page category showcases (1 hour cache)
export const getCachedTopProductsByCategory = unstable_cache(
    async (categorySlug: string, limit: number = 4) => {
        return getProductsByCategory(categorySlug, undefined, limit);
    },
    ["top-products-by-category"],
    { revalidate: 3600 } // Cache for 1 hour
);

// Fetch top products for each category (for home page) - uses cache
export async function getTopProductsByCategory(categorySlug: string, limit: number = 4): Promise<Product[]> {
    return getCachedTopProductsByCategory(categorySlug, limit);
}

// Fetch all products with pagination support
export async function getAllProducts(options?: {
    page?: number;
    limit?: number;
    includeTotal?: boolean;
}): Promise<{ products: Product[]; total?: number }> {
    try {
        const page = options?.page || 1;
        const limit = options?.limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: { isHidden: false }, // Don't show hidden products
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    stock: true,
                    subcategory: true,
                    createdAt: true,
                    category: { select: { name: true } },
                    images: { select: { url: true } },
                    variants: { select: { name: true, size: true, color: true, stock: true, imageUrl: true } },
                },
                orderBy: { createdAt: "desc" },
                ...(limit ? { take: limit, skip: (page - 1) * limit } : {}),
            }),
            options?.includeTotal ? prisma.product.count({ where: { isHidden: false } }) : Promise.resolve(undefined),
        ]);

        return {
            products: products.map(transformProduct),
            total,
        };
    } catch (error) {
        console.error("Error fetching all products:", error);
        return { products: [] };
    }
}

// Fetch a single product by ID or slug (with caching)
const getProductByIdOrSlugUncached = async (idOrSlug: string): Promise<Product | null> => {
    try {
        // Try to find by ID first, then by slug
        const product = await prisma.product.findFirst({
            where: {
                isHidden: false, // Don't show hidden products
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug },
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                subcategory: true,
                createdAt: true,
                category: { select: { name: true } },
                images: { select: { url: true } },
                variants: { select: { name: true, size: true, color: true, stock: true, imageUrl: true } },
            },
        });

        if (!product) return null;
        return transformProduct(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

// Cached version for product pages (5 minute cache)
export const getProductById = unstable_cache(
    getProductByIdOrSlugUncached,
    ["product-by-id"],
    { revalidate: 300, tags: ["products"] }
);

// Alias for slug-based lookup
export const getProductBySlug = getProductById;

// Cached categories (1 hour cache) - categories rarely change
export const getCachedCategories = unstable_cache(
    async () => {
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
    },
    ["all-categories"],
    { revalidate: 3600 } // Cache for 1 hour
);

// Fetch all categories
export async function getAllCategories(): Promise<{ name: string; slug: string; count: number }[]> {
    try {
        return getCachedCategories();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Cached active categories for navbar (5 min cache for faster updates)
export const getNavbarCategories = unstable_cache(
    async () => {
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
    },
    ["navbar-categories"],
    { revalidate: 300, tags: ["categories"] } // Cache for 5 minutes
);

// Fetch subcategories by category slug (cached for 1 hour)
export const getSubcategoriesByCategorySlug = unstable_cache(
    async (categorySlug: string) => {
        const category = await prisma.category.findUnique({
            where: { slug: categorySlug.toLowerCase() },
            select: {
                subcategories: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                    orderBy: { name: "asc" },
                },
            },
        });

        return category?.subcategories || [];
    },
    ["subcategories-by-slug"],
    { revalidate: 3600, tags: ["categories"] } // Cache for 1 hour
);

// Fetch featured products for homepage showcase (cached for 5 minutes)
// Optimized for handling many featured products from different categories
export const getFeaturedProducts = unstable_cache(
    async (limit: number = 12) => {
        try {
            const products = await prisma.product.findMany({
                where: {
                    isFeatured: true,
                    isHidden: false, // Don't show hidden products
                    stock: { gt: 0 }, // Only show in-stock products
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    stock: true,
                    subcategory: true,
                    createdAt: true,
                    category: { select: { name: true } },
                    images: { take: 4, select: { url: true } }, // Limit images per product for performance
                    variants: { select: { name: true, size: true, color: true, stock: true, imageUrl: true } },
                },
                orderBy: [
                    { createdAt: "desc" }, // Newest featured first
                ],
                take: limit,
            });

            return products.map(transformProduct);
        } catch (error) {
            console.error("Error fetching featured products:", error);
            return [];
        }
    },
    ["featured-products"],
    { revalidate: 300, tags: ["products"] } // Cache for 5 minutes
);