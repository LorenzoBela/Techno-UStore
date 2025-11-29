export interface ProductVariant {
    size: string;
    stock: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew?: boolean;
    stock: number;
    variants?: ProductVariant[];
}

export const topApparel: Product[] = [
    {
        id: "a1",
        name: "Adamson Hoodie 2024",
        price: 850,
        image: "",
        category: "Apparel",
        isNew: true,
        stock: 50,
        variants: [
            { size: "S", stock: 10 },
            { size: "M", stock: 20 },
            { size: "L", stock: 15 },
            { size: "XL", stock: 5 },
        ],
    },
    {
        id: "a2",
        name: "Classic Blue T-Shirt",
        price: 350,
        image: "",
        category: "Apparel",
        stock: 100,
        variants: [
            { size: "S", stock: 20 },
            { size: "M", stock: 40 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 10 },
        ],
    },
    {
        id: "a3",
        name: "Falcon Varsity Jacket",
        price: 1200,
        image: "",
        category: "Apparel",
        stock: 30,
        variants: [
            { size: "S", stock: 5 },
            { size: "M", stock: 10 },
            { size: "L", stock: 10 },
            { size: "XL", stock: 5 },
        ],
    },
    {
        id: "a4",
        name: "Polo Shirt - White",
        price: 550,
        image: "",
        category: "Apparel",
        stock: 75,
        variants: [
            { size: "S", stock: 15 },
            { size: "M", stock: 30 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 10 },
        ],
    },
];

export const topAccessories: Product[] = [
    { id: "ac1", name: "University Lanyard", price: 150, image: "", category: "Accessories", stock: 200 },
    { id: "ac2", name: "Blue Cap", price: 250, image: "", category: "Accessories", stock: 60 },
    { id: "ac3", name: "Tote Bag", price: 300, image: "", category: "Accessories", isNew: true, stock: 40 },
    { id: "ac4", name: "Umbrella", price: 400, image: "", category: "Accessories", stock: 80 },
];

export const topSupplies: Product[] = [
    { id: "s1", name: "Spiral Notebook", price: 80, image: "", category: "Supplies", stock: 150 },
    { id: "s2", name: "Ballpen Set", price: 50, image: "", category: "Supplies", stock: 300 },
    { id: "s3", name: "Art Kit", price: 450, image: "", category: "Supplies", isNew: true, stock: 25 },
    { id: "s4", name: "Folder", price: 20, image: "", category: "Supplies", stock: 500 },
];

export const topUniforms: Product[] = [
    {
        id: "u1",
        name: "PE T-Shirt",
        price: 350,
        image: "",
        category: "Uniforms",
        stock: 100,
        variants: [
            { size: "S", stock: 20 },
            { size: "M", stock: 40 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 10 },
        ],
    },
    {
        id: "u2",
        name: "PE Jogging Pants",
        price: 450,
        image: "",
        category: "Uniforms",
        stock: 90,
        variants: [
            { size: "S", stock: 20 },
            { size: "M", stock: 30 },
            { size: "L", stock: 30 },
            { size: "XL", stock: 10 },
        ],
    },
    {
        id: "u3",
        name: "School Uniform (M)",
        price: 650,
        image: "",
        category: "Uniforms",
        stock: 60,
        variants: [
            { size: "S", stock: 10 },
            { size: "M", stock: 20 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 10 },
        ],
    },
    {
        id: "u4",
        name: "School Uniform (F)",
        price: 650,
        image: "",
        category: "Uniforms",
        stock: 60,
        variants: [
            { size: "S", stock: 10 },
            { size: "M", stock: 20 },
            { size: "L", stock: 20 },
            { size: "XL", stock: 10 },
        ],
    },
];

export const allProducts: Product[] = [
    ...topApparel,
    ...topAccessories,
    ...topSupplies,
    ...topUniforms,
];
