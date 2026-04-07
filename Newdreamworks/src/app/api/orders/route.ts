import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";

type CreateOrderPayload = {
  productId: string;
  quantity: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress: string;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = (await request.json()) as Partial<CreateOrderPayload>;

    if (!body.productId || !mongoose.Types.ObjectId.isValid(body.productId)) {
      return NextResponse.json({ error: "Valid productId is required." }, { status: 400 });
    }

    if (!body.customerName?.trim() || !body.shippingAddress?.trim()) {
      return NextResponse.json(
        { error: "Customer name and shipping address are required." },
        { status: 400 }
      );
    }

    const quantity = Number(body.quantity ?? 1);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    const product = await ProductModel.findById(body.productId).lean();

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found or inactive." },
        { status: 404 }
      );
    }

    const order = await OrderModel.create({
      productId: product._id,
      productTitle: product.title,
      unitPrice: product.price,
      quantity,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone?.trim() ?? "",
      customerEmail: body.customerEmail?.trim() ?? "",
      shippingAddress: body.shippingAddress.trim(),
      notes: body.notes?.trim() ?? "",
      status: "placed",
    });

    return NextResponse.json(
      {
        message: "Order placed successfully.",
        orderId: order._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to place order", error);
    return NextResponse.json(
      { error: "Failed to place order." },
      { status: 500 }
    );
  }
}
