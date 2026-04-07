import StorefrontClient from "@/components/storefront-client";
import { demoProducts } from "@/lib/demo-products";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";
import type { ProductCard } from "@/types/storefront";

export const dynamic = "force-dynamic";

type ProductLike = {
  _id: { toString: () => string };
  title: string;
  category: string;
  description: string;
  price: number;
  image?: string;
};

async function getLiveProducts(): Promise<ProductCard[]> {
  try {
    await connectToDatabase();

    const products = await ProductModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean<ProductLike[]>();

    return products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image ?? "",
    }));
  } catch (error) {
    console.error("Failed to fetch live products", error);
    return [];
  }
}

export default async function Home() {
  const liveProducts = await getLiveProducts();
  const usesLiveProducts = liveProducts.length > 0;

  return (
    <StorefrontClient
      products={usesLiveProducts ? liveProducts : demoProducts}
      usesLiveProducts={usesLiveProducts}
    />
  );
}
