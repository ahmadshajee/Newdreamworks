import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/models/Product";

type CreateProductPayload = {
  title: string;
  category: string;
  description: string;
  price: number;
  image?: string;
};

type ProductLike = {
  _id: { toString: () => string };
  title: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  isActive?: boolean;
  createdAt?: string | Date;
};

const normalizeProduct = (product: ProductLike) => ({
  id: product._id.toString(),
  title: product.title,
  category: product.category,
  description: product.description,
  price: product.price,
  image: product.image ?? "",
  isActive: Boolean(product.isActive),
  createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : "",
});

export async function GET() {
  try {
    await connectToDatabase();
    const products = await ProductModel.find({})
      .sort({ createdAt: -1 })
      .lean<ProductLike[]>();
    return NextResponse.json(products.map(normalizeProduct));
  } catch (error) {
    console.error("Failed to fetch products", error);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as Partial<CreateProductPayload>;
    const title = body.title?.trim();
    const category = body.category?.trim();
    const description = body.description?.trim();
    const price = Number(body.price);

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Title, category, and description are required." },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a number greater than zero." },
        { status: 400 }
      );
    }

    const product = await ProductModel.create({
      title,
      category,
      description,
      price,
      image: body.image?.trim() ?? "",
      isActive: true,
    });

    return NextResponse.json(normalizeProduct(product.toObject()), {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create product", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
