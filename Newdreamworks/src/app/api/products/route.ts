import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

type ProductLike = {
  _id: { toString: () => string };
  title: string;
  category: string;
  description: string;
  price: number;
  image?: string;
};

export async function GET() {
  try {
    await connectToDatabase();

    const products = await ProductModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean<ProductLike[]>();

    const payload = products.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
      image: product.image ?? "",
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to fetch products", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}
