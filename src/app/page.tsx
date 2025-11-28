import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";

export default function Home() {
  // Mock Data for Showcases
  const topApparel = [
    { id: "a1", name: "Adamson Hoodie 2024", price: 850, image: "", category: "Apparel", isNew: true },
    { id: "a2", name: "Classic Blue T-Shirt", price: 350, image: "", category: "Apparel" },
    { id: "a3", name: "Falcon Varsity Jacket", price: 1200, image: "", category: "Apparel" },
    { id: "a4", name: "Polo Shirt - White", price: 550, image: "", category: "Apparel" },
  ];

  const topAccessories = [
    { id: "ac1", name: "University Lanyard", price: 150, image: "", category: "Accessories" },
    { id: "ac2", name: "Blue Cap", price: 250, image: "", category: "Accessories" },
    { id: "ac3", name: "Tote Bag", price: 300, image: "", category: "Accessories", isNew: true },
    { id: "ac4", name: "Umbrella", price: 400, image: "", category: "Accessories" },
  ];

  const topSupplies = [
    { id: "s1", name: "Spiral Notebook", price: 80, image: "", category: "Supplies" },
    { id: "s2", name: "Ballpen Set", price: 50, image: "", category: "Supplies" },
    { id: "s3", name: "Art Kit", price: 450, image: "", category: "Supplies", isNew: true },
    { id: "s4", name: "Folder", price: 20, image: "", category: "Supplies" },
  ];

  const topUniforms = [
    { id: "u1", name: "PE T-Shirt", price: 350, image: "", category: "Uniforms" },
    { id: "u2", name: "PE Jogging Pants", price: 450, image: "", category: "Uniforms" },
    { id: "u3", name: "School Uniform (M)", price: 650, image: "", category: "Uniforms" },
    { id: "u4", name: "School Uniform (F)", price: 650, image: "", category: "Uniforms" },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <CategoryGrid />

      <CategoryShowcase title="Top Apparel" href="/category/apparel" products={topApparel} />
      <CategoryShowcase title="Trending Accessories" href="/category/accessories" products={topAccessories} />

      <FeaturedSection />

      <CategoryShowcase title="School Supplies" href="/category/supplies" products={topSupplies} />
      <CategoryShowcase title="Official Uniforms" href="/category/uniforms" products={topUniforms} />
    </main>
  );
}
