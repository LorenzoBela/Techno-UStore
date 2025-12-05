// Product types - safe to import in client components

export interface ProductVariant {
    name?: string;
    size: string;
    color?: string;
    stock: number;
    imageUrl?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    subcategory?: string;
    isNew?: boolean;
    isFeatured?: boolean;
    stock: number;
    variants?: ProductVariant[];
}

export interface Category {
    name: string;
    slug: string;
    count: number;
}
