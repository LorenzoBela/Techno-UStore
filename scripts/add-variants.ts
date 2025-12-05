import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find Lebron Jersey product
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'Lebron', mode: 'insensitive' } },
        select: { id: true, name: true, images: { select: { url: true } } }
    });

    if (!product) {
        console.log('❌ Lebron Jersey product not found');
        return;
    }

    console.log('✅ Found product:', product.name, '(ID:', product.id, ')');

    // Check if variants already exist
    const existingVariants = await prisma.productVariant.findMany({
        where: { productId: product.id }
    });

    if (existingVariants.length > 0) {
        console.log('⚠️ Product already has', existingVariants.length, 'variants');
        console.log('Existing variants:', existingVariants.map(v => `${v.size} - ${v.color}`).join(', '));
        return;
    }

    // Get first image URL for variants (or use null)
    const imageUrl = product.images[0]?.url || null;

    // Add variants - typical jersey sizes
    const variants = [
        { size: 'Small', color: 'Lakers Purple', name: 'Lakers Purple', stock: 5 },
        { size: 'Medium', color: 'Lakers Purple', name: 'Lakers Purple', stock: 8 },
        { size: 'Large', color: 'Lakers Purple', name: 'Lakers Purple', stock: 10 },
        { size: 'X-Large', color: 'Lakers Purple', name: 'Lakers Purple', stock: 6 },
        { size: 'XX-Large', color: 'Lakers Purple', name: 'Lakers Purple', stock: 3 },
        { size: 'Small', color: 'Lakers Gold', name: 'Lakers Gold', stock: 4 },
        { size: 'Medium', color: 'Lakers Gold', name: 'Lakers Gold', stock: 7 },
        { size: 'Large', color: 'Lakers Gold', name: 'Lakers Gold', stock: 9 },
        { size: 'X-Large', color: 'Lakers Gold', name: 'Lakers Gold', stock: 5 },
        { size: 'XX-Large', color: 'Lakers Gold', name: 'Lakers Gold', stock: 2 },
    ];

    console.log('📦 Adding', variants.length, 'variants...');

    for (const variant of variants) {
        await prisma.productVariant.create({
            data: {
                productId: product.id,
                size: variant.size,
                color: variant.color,
                name: variant.name,
                stock: variant.stock,
                imageUrl: imageUrl,
            }
        });
        console.log(`  ✓ Added: ${variant.name} - ${variant.size} (Stock: ${variant.stock})`);
    }

    // Update product total stock
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    await prisma.product.update({
        where: { id: product.id },
        data: { stock: totalStock }
    });

    console.log('\n✅ Successfully added', variants.length, 'variants to', product.name);
    console.log('📊 Total stock updated to:', totalStock);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

