import prisma from "../src/lib/db";

// Categories and Subcategories for Adamson University Store
const categories = [
    {
        name: "Apparel",
        slug: "apparel",
        description: "Official Adamson University clothing and uniforms",
        displayOrder: 1,
        subcategories: [
            { name: "T-Shirts", slug: "t-shirts" },
            { name: "Polo Shirts", slug: "polo-shirts" },
            { name: "Jackets", slug: "jackets" },
            { name: "Hoodies & Sweaters", slug: "hoodies-sweaters" },
            { name: "Jerseys", slug: "jerseys" },
            { name: "Traditional Wear", slug: "traditional-wear" },
        ],
    },
    {
        name: "Bags",
        slug: "bags",
        description: "Backpacks, laptop bags, and utility bags",
        displayOrder: 2,
        subcategories: [
            { name: "Backpacks", slug: "backpacks" },
            { name: "Tote Bags", slug: "tote-bags" },
            { name: "Specialty Bags", slug: "specialty-bags" },
        ],
    },
    {
        name: "Accessories",
        slug: "accessories",
        description: "Caps, keychains, and personal accessories",
        displayOrder: 3,
        subcategories: [
            { name: "Caps & Headwear", slug: "caps-headwear" },
            { name: "Keychains", slug: "keychains" },
            { name: "Pins & Badges", slug: "pins-badges" },
            { name: "Scarves & Ribbons", slug: "scarves-ribbons" },
            { name: "Sunglasses", slug: "sunglasses" },
        ],
    },
    {
        name: "Drinkware",
        slug: "drinkware",
        description: "Mugs, tumblers, and beverage containers",
        displayOrder: 4,
        subcategories: [
            { name: "Mugs", slug: "mugs" },
            { name: "Tumblers", slug: "tumblers" },
        ],
    },
    {
        name: "Stationery",
        slug: "stationery",
        description: "Notebooks, pens, and office supplies",
        displayOrder: 5,
        subcategories: [
            { name: "Notebooks", slug: "notebooks" },
            { name: "Writing Instruments", slug: "writing-instruments" },
            { name: "Desk Accessories", slug: "desk-accessories" },
        ],
    },
    {
        name: "Tech & Electronics",
        slug: "tech-electronics",
        description: "Gadgets, chargers, and electronic accessories",
        displayOrder: 6,
        subcategories: [
            { name: "Power & Charging", slug: "power-charging" },
            { name: "Computer Accessories", slug: "computer-accessories" },
            { name: "Lighting & Fans", slug: "lighting-fans" },
        ],
    },
    {
        name: "Home & Living",
        slug: "home-living",
        description: "Home decor and lifestyle items",
        displayOrder: 7,
        subcategories: [
            { name: "Kitchen & Dining", slug: "kitchen-dining" },
            { name: "Decor", slug: "decor" },
            { name: "Utility", slug: "utility" },
        ],
    },
    {
        name: "Stickers & Novelty",
        slug: "stickers-novelty",
        description: "Stickers, magnets, and collectibles",
        displayOrder: 8,
        subcategories: [
            { name: "Stickers", slug: "stickers" },
            { name: "Collectibles", slug: "collectibles" },
        ],
    },
];

// Helper to create slug from name
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[&]/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// Product definitions with category, subcategory, and price
const products: {
    name: string;
    category: string;
    subcategory: string;
    price: number;
    description?: string;
}[] = [
        // ===== APPAREL - T-SHIRTS =====
        { name: "COOLEGIT SHIRT ADAMTEC", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Official Adamson TEC shirt by Coolegit" },
        { name: "COOLEGIT SHIRT BLURRED", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Blurred design shirt by Coolegit" },
        { name: "COOLEGIT SHIRT CLASSIC", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Classic design shirt by Coolegit" },
        { name: "COOLEGIT SHIRT DRIP", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Drip design shirt by Coolegit" },
        { name: "COOLEGIT SHIRT EMBOSSED", category: "Apparel", subcategory: "T-Shirts", price: 449, description: "Embossed design shirt by Coolegit" },
        { name: "COOLEGIT SHIRT EMBOSSED v2", category: "Apparel", subcategory: "T-Shirts", price: 449, description: "Embossed design v2 shirt by Coolegit" },
        { name: "COOLEGIT SHIRT LINE 24 SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Line 24 edition shirt" },
        { name: "COOLEGIT SHIRT REN 24", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Ren 24 edition shirt" },
        { name: "COOLEGIT SHIRT STRANGE CLOUD", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Strange Cloud design shirt" },
        { name: "COOLEGIT SHIRT UNAWAKANAHIMO", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Unawakanahimo design shirt" },
        { name: "COOLEGIT SHIRT WAR 24", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "War 24 edition shirt" },
        { name: "COOLEGIT SHIRT WESTCON", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Westcon design shirt" },
        { name: "COOLEGIT SHOPEE", category: "Apparel", subcategory: "T-Shirts", price: 349, description: "Shopee collab shirt" },
        { name: "BOOSTER SHIRT UAAP S88", category: "Apparel", subcategory: "T-Shirts", price: 450, description: "UAAP Season 88 booster shirt" },
        { name: "ECO FALCON SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 350, description: "Eco-friendly Falcon shirt" },
        { name: "KLASMEYT SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Klasmeyt collection shirt" },
        { name: "NEW JOY DRI FIT", category: "Apparel", subcategory: "T-Shirts", price: 450, description: "Dri-fit athletic shirt" },
        { name: "NEW JOY ELITE OVERSIZED SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 499, description: "Elite oversized casual shirt" },
        { name: "NEW JOY EMBOSSED", category: "Apparel", subcategory: "T-Shirts", price: 449, description: "Embossed design shirt" },
        { name: "NEW JOY KIDS SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 299, description: "Kids size Adamson shirt" },
        { name: "UNIVERSIDAD BLINDS SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Universidad Blinds design" },
        { name: "UNIVERSIDAD EXTREME SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Universidad Extreme design" },
        { name: "UNIVERSIDAD MAXX SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Universidad Maxx design" },
        { name: "UNIVERSIDAD SPANDEE TEE", category: "Apparel", subcategory: "T-Shirts", price: 450, description: "Spandex blend tee" },
        { name: "UNIVERSIDAD TYPO SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Typography design shirt" },
        { name: "UNIVERSIDAD VEIN SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Vein design shirt" },
        { name: "UNIVERSIDAD WREATH SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "Wreath design shirt" },
        { name: "VLC CLASSIC SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "VLC Classic design shirt" },
        { name: "VLC EMBLEM SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "VLC Emblem design shirt" },
        { name: "VLC RETRO SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 399, description: "VLC Retro design shirt" },
        { name: "VLC ATHLETIC SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 450, description: "VLC Athletic performance shirt" },
        { name: "VLC BASEBALL SHIRT", category: "Apparel", subcategory: "T-Shirts", price: 449, description: "VLC Baseball style shirt" },

        // ===== APPAREL - POLO SHIRTS =====
        { name: "AMETROS POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Ametros collection polo shirt" },
        { name: "BARO POLO SHIRT 2023", category: "Apparel", subcategory: "Polo Shirts", price: 649, description: "Baro 2023 edition polo shirt" },
        { name: "ECO FALCON POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 550, description: "Eco-friendly Falcon polo shirt" },
        { name: "EM POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 549, description: "EM collection polo shirt" },
        { name: "NEW JOY DRI FIT POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Dri-fit athletic polo shirt" },
        { name: "NEW JOY LIFELINE POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Lifeline collection polo shirt" },
        { name: "NEW JOY POLO SHIRT CLASSIC", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Classic style polo shirt" },
        { name: "NEW JOY POLO SHIRT W/ LINING", category: "Apparel", subcategory: "Polo Shirts", price: 649, description: "Polo shirt with accent lining" },
        { name: "UNIVERSIDAD BEJ POLO shirt", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Universidad BEJ polo shirt" },
        { name: "UNIVERSIDAD SAGE POLO SHIRT", category: "Apparel", subcategory: "Polo Shirts", price: 599, description: "Universidad Sage polo shirt" },

        // ===== APPAREL - JACKETS =====
        { name: "AMETROS VARSITY JACKET", category: "Apparel", subcategory: "Jackets", price: 1499, description: "Ametros varsity jacket" },
        { name: "AMETROS WINDBREAKER JACKET", category: "Apparel", subcategory: "Jackets", price: 999, description: "Ametros windbreaker jacket" },
        { name: "BARO JACKET PREMIUM NEW", category: "Apparel", subcategory: "Jackets", price: 1299, description: "Premium Baro jacket new edition" },
        { name: "BARO VARSITY JACKET", category: "Apparel", subcategory: "Jackets", price: 1499, description: "Baro varsity jacket" },
        { name: "BOMBER JACKET BY ESTER", category: "Apparel", subcategory: "Jackets", price: 1199, description: "Bomber jacket by Ester" },
        { name: "COOLEGIT BOMBER JACKET", category: "Apparel", subcategory: "Jackets", price: 1299, description: "Coolegit bomber jacket" },
        { name: "NEW JOY EXECUTIVE JACKET", category: "Apparel", subcategory: "Jackets", price: 1499, description: "Executive style jacket" },
        { name: "NEW JOY JACKET REVERSIBLE", category: "Apparel", subcategory: "Jackets", price: 1399, description: "Reversible jacket" },
        { name: "NEW JOY VARSITY JACKET 2023", category: "Apparel", subcategory: "Jackets", price: 1599, description: "2023 edition varsity jacket" },
        { name: "UNIVERSIDAD ARCH JACKET", category: "Apparel", subcategory: "Jackets", price: 1299, description: "Universidad Arch jacket" },
        { name: "UNIVERSIDAD ZHASK SHIRT JACKET", category: "Apparel", subcategory: "Jackets", price: 999, description: "Zhask shirt jacket hybrid" },
        { name: "VLC VARSITY JACKET", category: "Apparel", subcategory: "Jackets", price: 1499, description: "VLC varsity jacket" },

        // ===== APPAREL - HOODIES & SWEATERS =====
        { name: "BARO KLASMEYT SWEATSHIRT GRAY", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 799, description: "Klasmeyt gray sweatshirt" },
        { name: "BARO LONG SLEEVE W/ HOOD", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 899, description: "Long sleeve hooded shirt" },
        { name: "BARO PULLOVER", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 799, description: "Baro pullover sweater" },
        { name: "BARO SWEATER", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 799, description: "Baro sweater" },
        { name: "BARO TURTLE NECK", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 699, description: "Baro turtle neck" },
        { name: "COOLEGIT HOODIE FUN 2023", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 999, description: "Fun 2023 hoodie" },
        { name: "COOLEGIT HOODIE JACKET", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 1099, description: "Hoodie jacket combo" },
        { name: "KLASMEYT HOODIE", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 899, description: "Klasmeyt hoodie" },
        { name: "NEW JOY HOODIE", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 999, description: "New Joy hoodie" },
        { name: "VLC HOODIE", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 999, description: "VLC hoodie" },
        { name: "VLC SWEAT SHIRT", category: "Apparel", subcategory: "Hoodies & Sweaters", price: 799, description: "VLC sweatshirt" },

        // ===== APPAREL - JERSEYS =====
        { name: "NEW JOY JERSEY SUBLI", category: "Apparel", subcategory: "Jerseys", price: 549, description: "Sublimation printed jersey" },
        { name: "UNIVERSIDAD RISS JERSEY SANDO", category: "Apparel", subcategory: "Jerseys", price: 499, description: "Riss jersey sando" },
        { name: "VLC BALLER", category: "Apparel", subcategory: "Jerseys", price: 549, description: "VLC Baller jersey" },
        { name: "VLC BASKETBALL SHIRT", category: "Apparel", subcategory: "Jerseys", price: 549, description: "VLC basketball shirt" },
        { name: "VLC VOLLEYBALL SHIRT", category: "Apparel", subcategory: "Jerseys", price: 549, description: "VLC volleyball shirt" },

        // ===== APPAREL - TRADITIONAL WEAR =====
        { name: "AMETROS VEST", category: "Apparel", subcategory: "Traditional Wear", price: 699, description: "Ametros formal vest" },
        { name: "BARO CROPTOP", category: "Apparel", subcategory: "Traditional Wear", price: 399, description: "Baro croptop" },
        { name: "BARO VEST", category: "Apparel", subcategory: "Traditional Wear", price: 649, description: "Baro vest" },
        { name: "BARO VEST BLOUSE", category: "Apparel", subcategory: "Traditional Wear", price: 599, description: "Baro vest blouse" },
        { name: "NEW JOY COTTON", category: "Apparel", subcategory: "Traditional Wear", price: 450, description: "Cotton traditional wear" },

        // ===== BAGS - BACKPACKS =====
        { name: "BAG BACK PACK", category: "Bags", subcategory: "Backpacks", price: 899, description: "Adamson backpack" },
        { name: "BAG LAPTOP", category: "Bags", subcategory: "Backpacks", price: 999, description: "Laptop backpack" },
        { name: "BAG NETBOOK", category: "Bags", subcategory: "Backpacks", price: 799, description: "Netbook bag" },

        // ===== BAGS - TOTE BAGS =====
        { name: "BAG ABACA", category: "Bags", subcategory: "Tote Bags", price: 399, description: "Abaca material tote bag" },
        { name: "BARO ECO BAG", category: "Bags", subcategory: "Tote Bags", price: 199, description: "Baro eco-friendly bag" },
        { name: "ECO BAG BASIC SMALL", category: "Bags", subcategory: "Tote Bags", price: 149, description: "Basic small eco bag" },
        { name: "ECO BAG BLUE NJ", category: "Bags", subcategory: "Tote Bags", price: 199, description: "Blue eco bag by New Joy" },
        { name: "ECO BAG LAMINATED", category: "Bags", subcategory: "Tote Bags", price: 249, description: "Laminated eco bag" },
        { name: "ECO BAG LASER PRINT", category: "Bags", subcategory: "Tote Bags", price: 279, description: "Laser printed eco bag" },
        { name: "KATCHA TOTE BAG", category: "Bags", subcategory: "Tote Bags", price: 349, description: "Katcha tote bag" },
        { name: "KLASMEYT TOTE BAG", category: "Bags", subcategory: "Tote Bags", price: 349, description: "Klasmeyt tote bag" },
        { name: "TOTE BAG WITH ZIPPER", category: "Bags", subcategory: "Tote Bags", price: 399, description: "Tote bag with zipper" },
        { name: "TOTEBAG ADAMSON", category: "Bags", subcategory: "Tote Bags", price: 349, description: "Adamson tote bag" },

        // ===== BAGS - SPECIALTY BAGS =====
        { name: "BAG GYM", category: "Bags", subcategory: "Specialty Bags", price: 599, description: "Gym bag" },
        { name: "BAG LUNCH", category: "Bags", subcategory: "Specialty Bags", price: 299, description: "Lunch bag" },
        { name: "BAG SLING", category: "Bags", subcategory: "Specialty Bags", price: 449, description: "Sling bag" },
        { name: "BAG STRING", category: "Bags", subcategory: "Specialty Bags", price: 199, description: "String bag / drawstring" },
        { name: "KATCHA BAG LINING NAVY BLUE", category: "Bags", subcategory: "Specialty Bags", price: 499, description: "Katcha bag with navy blue lining" },
        { name: "NEW JOY SHOE POUCH", category: "Bags", subcategory: "Specialty Bags", price: 249, description: "Shoe pouch bag" },

        // ===== ACCESSORIES - CAPS & HEADWEAR =====
        { name: "CAP BIG EMBRO NEW JOY W/B/BR", category: "Accessories", subcategory: "Caps & Headwear", price: 399, description: "Big embroidery cap in White/Blue/Brown" },
        { name: "CAP EMBRO BLUE NEW JOY", category: "Accessories", subcategory: "Caps & Headwear", price: 399, description: "Embroidered blue cap" },
        { name: "CAP UNIVERSIDAD XEN EMBRO CAP WHITE", category: "Accessories", subcategory: "Caps & Headwear", price: 399, description: "Universidad embroidered white cap" },
        { name: "VLC CAPS", category: "Accessories", subcategory: "Caps & Headwear", price: 349, description: "VLC cap" },

        // ===== ACCESSORIES - KEYCHAINS =====
        { name: "KEYCHAIN BAMBOO NJ", category: "Accessories", subcategory: "Keychains", price: 99, description: "Bamboo keychain" },
        { name: "KEYCHAIN SEAL MARGINES", category: "Accessories", subcategory: "Keychains", price: 129, description: "Seal Margines keychain" },
        { name: "VLC KEYCHAIN", category: "Accessories", subcategory: "Keychains", price: 99, description: "VLC keychain" },

        // ===== ACCESSORIES - PINS & BADGES =====
        { name: "ADU DOG TAG", category: "Accessories", subcategory: "Pins & Badges", price: 149, description: "Adamson University dog tag" },
        { name: "ADU PIN BRASS", category: "Accessories", subcategory: "Pins & Badges", price: 99, description: "Brass Adamson pin" },
        { name: "KLASMEYT BADGE REF MAGNET", category: "Accessories", subcategory: "Pins & Badges", price: 79, description: "Klasmeyt badge refrigerator magnet" },

        // ===== ACCESSORIES - SCARVES & RIBBONS =====
        { name: "RIBBON NJ W/ ADAMSON PRINT", category: "Accessories", subcategory: "Scarves & Ribbons", price: 149, description: "Ribbon with Adamson print" },
        { name: "VLC SCARF", category: "Accessories", subcategory: "Scarves & Ribbons", price: 299, description: "VLC scarf" },

        // ===== ACCESSORIES - SUNGLASSES =====
        { name: "KLASMEYT SUNGLASSES W/CASE", category: "Accessories", subcategory: "Sunglasses", price: 299, description: "Klasmeyt sunglasses with case" },

        // ===== DRINKWARE - MUGS =====
        { name: "MUG ADAMSON U", category: "Drinkware", subcategory: "Mugs", price: 249, description: "Adamson University mug" },
        { name: "MUG ADU FAÇADE", category: "Drinkware", subcategory: "Mugs", price: 279, description: "Mug with ADU façade design" },
        { name: "MUG CERAMIC", category: "Drinkware", subcategory: "Mugs", price: 199, description: "Ceramic mug" },
        { name: "MUG COFFEE PRESS 600ML", category: "Drinkware", subcategory: "Mugs", price: 449, description: "Coffee press mug 600ml" },
        { name: "MUG COOLEGIT TWO DESIGN", category: "Drinkware", subcategory: "Mugs", price: 279, description: "Coolegit two-design mug" },
        { name: "MUG DOUBLE WALL ENGRAVE 600ML", category: "Drinkware", subcategory: "Mugs", price: 499, description: "Double wall engraved mug 600ml" },
        { name: "MUG FALCON V2 NJ", category: "Drinkware", subcategory: "Mugs", price: 249, description: "Falcon v2 mug" },
        { name: "MUG NEW FALCON", category: "Drinkware", subcategory: "Mugs", price: 249, description: "New Falcon design mug" },
        { name: "MUG SOARING FALCONS", category: "Drinkware", subcategory: "Mugs", price: 279, description: "Soaring Falcons mug" },
        { name: "MUG W/ CORK NJ", category: "Drinkware", subcategory: "Mugs", price: 349, description: "Mug with cork base" },
        { name: "MUG W/ SPOON BAMBOO NEW JOY", category: "Drinkware", subcategory: "Mugs", price: 349, description: "Mug with bamboo spoon" },
        { name: "KLASMEYT MUG", category: "Drinkware", subcategory: "Mugs", price: 249, description: "Klasmeyt mug" },

        // ===== DRINKWARE - TUMBLERS =====
        { name: "TUMBLER AQUAFLASK KLASMEYT BLUE", category: "Drinkware", subcategory: "Tumblers", price: 799, description: "Aquaflask Klasmeyt blue tumbler" },
        { name: "TUMBLER VACUUM FLASK", category: "Drinkware", subcategory: "Tumblers", price: 599, description: "Vacuum flask tumbler" },
        { name: "KLASMEYT TUMBLER", category: "Drinkware", subcategory: "Tumblers", price: 499, description: "Klasmeyt tumbler" },
        { name: "NEW JOY BIG TUMBLER", category: "Drinkware", subcategory: "Tumblers", price: 649, description: "Big tumbler" },

        // ===== STATIONERY - NOTEBOOKS =====
        { name: "NOTEBOOK BAMBOO NJ", category: "Stationery", subcategory: "Notebooks", price: 299, description: "Bamboo cover notebook" },
        { name: "NOTEBOOK HERMES STYLE NB NJ", category: "Stationery", subcategory: "Notebooks", price: 399, description: "Hermes style notebook" },
        { name: "NOTEBOOK LIBELLO UNIVERSIDAD NAVY BLUE", category: "Stationery", subcategory: "Notebooks", price: 349, description: "Libello navy blue notebook" },
        { name: "NOTEBOOK NAVY BLUE", category: "Stationery", subcategory: "Notebooks", price: 249, description: "Navy blue notebook" },
        { name: "NOTEBOOK TRANSPARENT", category: "Stationery", subcategory: "Notebooks", price: 199, description: "Transparent cover notebook" },
        { name: "NOTEBOOOK LEATHER", category: "Stationery", subcategory: "Notebooks", price: 449, description: "Leather notebook" },
        { name: "NEW JOY BAMBOO NOTEPAD", category: "Stationery", subcategory: "Notebooks", price: 199, description: "Bamboo notepad" },
        { name: "NEW JOY BLACK LEATHER NOTEBOOK", category: "Stationery", subcategory: "Notebooks", price: 499, description: "Black leather notebook" },
        { name: "NEW JOY BLUE NOTEBOOK W/ POST IT", category: "Stationery", subcategory: "Notebooks", price: 349, description: "Blue notebook with post-it notes" },
        { name: "NEW JOY LEATHER NOTEBOOK W COLOR", category: "Stationery", subcategory: "Notebooks", price: 449, description: "Leather notebook with color" },
        { name: "NEW JOY NOTEBOOK SET W/ BOX", category: "Stationery", subcategory: "Notebooks", price: 599, description: "Notebook set with box" },

        // ===== STATIONERY - WRITING INSTRUMENTS =====
        { name: "BALLPEN BAMBOO", category: "Stationery", subcategory: "Writing Instruments", price: 79, description: "Bamboo ballpen" },
        { name: "BALLPEN BAMBOO W/ CASE", category: "Stationery", subcategory: "Writing Instruments", price: 149, description: "Bamboo ballpen with case" },
        { name: "BALLPEN CASE", category: "Stationery", subcategory: "Writing Instruments", price: 99, description: "Ballpen case" },
        { name: "BALLPEN GIFT SET", category: "Stationery", subcategory: "Writing Instruments", price: 299, description: "Ballpen gift set" },
        { name: "BALLPEN NEW JOY SIGNPEN PARKER", category: "Stationery", subcategory: "Writing Instruments", price: 249, description: "Parker style signpen" },
        { name: "BALLPEN ORDINARY", category: "Stationery", subcategory: "Writing Instruments", price: 29, description: "Ordinary ballpen" },
        { name: "BALLPEN SIGN PEN", category: "Stationery", subcategory: "Writing Instruments", price: 49, description: "Sign pen" },
        { name: "COLORED SIGN PEN", category: "Stationery", subcategory: "Writing Instruments", price: 79, description: "Colored sign pen" },
        { name: "KLASMEYT BAMBOO BALLPEN W/ CASE", category: "Stationery", subcategory: "Writing Instruments", price: 149, description: "Klasmeyt bamboo ballpen with case" },

        // ===== STATIONERY - DESK ACCESSORIES =====
        { name: "DESK MAT BY NJ", category: "Stationery", subcategory: "Desk Accessories", price: 399, description: "Desk mat" },
        { name: "CARD HOLDER N. BLUE NEWJOY", category: "Stationery", subcategory: "Desk Accessories", price: 199, description: "Navy blue card holder" },
        { name: "NEW JOY MOUSE PAD SMALL", category: "Stationery", subcategory: "Desk Accessories", price: 199, description: "Small mouse pad" },
        { name: "NEW JOY ROTATING CALENDAR", category: "Stationery", subcategory: "Desk Accessories", price: 299, description: "Rotating calendar" },
        { name: "NEW JOY WOODEN CALENDAR", category: "Stationery", subcategory: "Desk Accessories", price: 349, description: "Wooden calendar" },
        { name: "PASSPORT HOLDER", category: "Stationery", subcategory: "Desk Accessories", price: 249, description: "Passport holder" },
        { name: "PASSPORT HOLDER LEATHER", category: "Stationery", subcategory: "Desk Accessories", price: 349, description: "Leather passport holder" },
        { name: "PAPER BAG BROWN", category: "Stationery", subcategory: "Desk Accessories", price: 29, description: "Brown paper bag" },
        { name: "PAPER BAG GLOSSY", category: "Stationery", subcategory: "Desk Accessories", price: 49, description: "Glossy paper bag" },

        // ===== TECH & ELECTRONICS - POWER & CHARGING =====
        { name: "AKARI ADU POWERBANK", category: "Tech & Electronics", subcategory: "Power & Charging", price: 799, description: "Akari ADU branded powerbank" },
        { name: "CHARGER CASE ADU", category: "Tech & Electronics", subcategory: "Power & Charging", price: 149, description: "Charger case with ADU branding" },
        { name: "NEW JOY USB CORD", category: "Tech & Electronics", subcategory: "Power & Charging", price: 199, description: "USB charging cord" },

        // ===== TECH & ELECTRONICS - COMPUTER ACCESSORIES =====
        { name: "FLASHDRIVE WHITE NJ", category: "Tech & Electronics", subcategory: "Computer Accessories", price: 349, description: "White flash drive" },
        { name: "FLASHDRIVE WOODEN NJ", category: "Tech & Electronics", subcategory: "Computer Accessories", price: 399, description: "Wooden flash drive" },
        { name: "BAMBOO CELLPHONE HOLDER", category: "Tech & Electronics", subcategory: "Computer Accessories", price: 199, description: "Bamboo cellphone holder" },
        { name: "KLASMEYT PHONE HOLDER", category: "Tech & Electronics", subcategory: "Computer Accessories", price: 179, description: "Klasmeyt phone holder" },

        // ===== TECH & ELECTRONICS - LIGHTING & FANS =====
        { name: "AKARI ADU DESKLAMP", category: "Tech & Electronics", subcategory: "Lighting & Fans", price: 699, description: "Akari ADU desk lamp" },
        { name: "AKARI ADU ELLIPTICAL FAN W/ LED", category: "Tech & Electronics", subcategory: "Lighting & Fans", price: 599, description: "Elliptical fan with LED" },
        { name: "AKARI ADU HANDY FAN POWER", category: "Tech & Electronics", subcategory: "Lighting & Fans", price: 399, description: "Handy fan with power function" },
        { name: "NEW JOY ABACA LAMP", category: "Tech & Electronics", subcategory: "Lighting & Fans", price: 599, description: "Abaca material lamp" },

        // ===== HOME & LIVING - KITCHEN & DINING =====
        { name: "BAMBOO COASTER", category: "Home & Living", subcategory: "Kitchen & Dining", price: 99, description: "Bamboo coaster" },
        { name: "SPOON & FORK WOODEN", category: "Home & Living", subcategory: "Kitchen & Dining", price: 149, description: "Wooden spoon and fork set" },
        { name: "SPOON AND FORK METAL W/ BLACK POUCH", category: "Home & Living", subcategory: "Kitchen & Dining", price: 199, description: "Metal spoon and fork with pouch" },
        { name: "SPOON FORK CHOPSTICK STRAW SET", category: "Home & Living", subcategory: "Kitchen & Dining", price: 249, description: "Complete utensil set" },
        { name: "NEW JOY WOODEN STRAW SET", category: "Home & Living", subcategory: "Kitchen & Dining", price: 149, description: "Wooden straw set" },
        { name: "WOODEN CAN OPENER", category: "Home & Living", subcategory: "Kitchen & Dining", price: 129, description: "Wooden can opener" },
        { name: "PLATE W/ ADU LOGO", category: "Home & Living", subcategory: "Kitchen & Dining", price: 299, description: "Plate with ADU logo" },
        { name: "ADAMSON CANDY", category: "Home & Living", subcategory: "Kitchen & Dining", price: 49, description: "Adamson branded candy" },

        // ===== HOME & LIVING - DECOR =====
        { name: "WALL CLOCK", category: "Home & Living", subcategory: "Decor", price: 599, description: "Adamson wall clock" },
        { name: "NEW JOY CRYSTAL BALL", category: "Home & Living", subcategory: "Decor", price: 399, description: "Crystal ball decor" },
        { name: "NEW JOY CHESS BOARD", category: "Home & Living", subcategory: "Decor", price: 699, description: "Chess board set" },

        // ===== HOME & LIVING - UTILITY =====
        { name: "UMBRELLA AUTOMATIC", category: "Home & Living", subcategory: "Utility", price: 449, description: "Automatic umbrella" },
        { name: "UMBRELLA POCKET W/POUCH", category: "Home & Living", subcategory: "Utility", price: 349, description: "Pocket umbrella with pouch" },
        { name: "BARO FACE TOWEL", category: "Home & Living", subcategory: "Utility", price: 149, description: "Baro face towel" },
        { name: "BARO HANDKERCHIEF", category: "Home & Living", subcategory: "Utility", price: 99, description: "Baro handkerchief" },
        { name: "TISSUE HOLDER BAMBOO", category: "Home & Living", subcategory: "Utility", price: 249, description: "Bamboo tissue holder" },
        { name: "TISSUE HOLDER PLASTIC", category: "Home & Living", subcategory: "Utility", price: 149, description: "Plastic tissue holder" },
        { name: "TISSUE HOLDER ROUND", category: "Home & Living", subcategory: "Utility", price: 179, description: "Round tissue holder" },

        // ===== STICKERS & NOVELTY - STICKERS =====
        { name: "STICKER ADAMSON RECTANGLE W/ LOGO", category: "Stickers & Novelty", subcategory: "Stickers", price: 29, description: "Rectangle sticker with logo" },
        { name: "STICKER ADAMSON ROUND LOGO NJ", category: "Stickers & Novelty", subcategory: "Stickers", price: 29, description: "Round logo sticker" },
        { name: "STICKER ADAMSON W/ WEBSITE", category: "Stickers & Novelty", subcategory: "Stickers", price: 29, description: "Sticker with website" },
        { name: "STICKER FACADE MARGINES", category: "Stickers & Novelty", subcategory: "Stickers", price: 39, description: "Façade Margines sticker" },
        { name: "STICKER NEW FALCON LOGO", category: "Stickers & Novelty", subcategory: "Stickers", price: 29, description: "New Falcon logo sticker" },
        { name: "STICKER PACK NEW JOY", category: "Stickers & Novelty", subcategory: "Stickers", price: 99, description: "New Joy sticker pack" },
        { name: "STICKER VINYL COOLEGIT", category: "Stickers & Novelty", subcategory: "Stickers", price: 49, description: "Vinyl Coolegit sticker" },
        { name: "VLC STICKER LONG", category: "Stickers & Novelty", subcategory: "Stickers", price: 39, description: "VLC long sticker" },
        { name: "VLC STICKER PACK", category: "Stickers & Novelty", subcategory: "Stickers", price: 99, description: "VLC sticker pack" },
    ];

async function main() {
    console.log("🚀 Starting UStore Items seed...\n");

    // Create categories and subcategories
    console.log("📁 Creating categories and subcategories...");
    const categoryMap: Record<string, string> = {};
    const subcategoryMap: Record<string, string> = {};

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {
                name: cat.name,
                description: cat.description,
                displayOrder: cat.displayOrder,
                isActive: true,
            },
            create: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                displayOrder: cat.displayOrder,
                isActive: true,
            },
        });
        categoryMap[cat.name] = category.id;
        console.log(`  ✓ Category: ${cat.name}`);

        for (const sub of cat.subcategories) {
            const subcategory = await prisma.subcategory.upsert({
                where: {
                    categoryId_slug: {
                        categoryId: category.id,
                        slug: sub.slug,
                    },
                },
                update: { name: sub.name },
                create: {
                    name: sub.name,
                    slug: sub.slug,
                    categoryId: category.id,
                },
            });
            subcategoryMap[`${cat.name}|${sub.name}`] = subcategory.id;
            console.log(`    ↳ Subcategory: ${sub.name}`);
        }
    }

    // Create products
    console.log("\n📦 Creating products...");
    let created = 0;
    let updated = 0;

    for (const prod of products) {
        const slug = createSlug(prod.name);
        const categoryId = categoryMap[prod.category];
        const subcategoryId = subcategoryMap[`${prod.category}|${prod.subcategory}`];

        if (!categoryId) {
            console.log(`  ⚠️ Skipping ${prod.name}: Category "${prod.category}" not found`);
            continue;
        }

        const existing = await prisma.product.findUnique({ where: { slug } });

        if (existing) {
            await prisma.product.update({
                where: { slug },
                data: {
                    name: prod.name,
                    description: prod.description || `${prod.name} - Official Adamson University merchandise`,
                    price: prod.price,
                    categoryId,
                    subcategoryId,
                    subcategory: prod.subcategory,
                },
            });
            updated++;
        } else {
            await prisma.product.create({
                data: {
                    name: prod.name,
                    slug,
                    description: prod.description || `${prod.name} - Official Adamson University merchandise`,
                    price: prod.price,
                    stock: 100, // Default stock
                    categoryId,
                    subcategoryId,
                    subcategory: prod.subcategory,
                },
            });
            created++;
        }
    }

    console.log(`\n✅ Done! Created ${created} products, updated ${updated} products.`);
    console.log(`📊 Total products in database: ${await prisma.product.count()}`);
    console.log(`📁 Total categories: ${await prisma.category.count()}`);
    console.log(`📂 Total subcategories: ${await prisma.subcategory.count()}`);
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
