import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

type OrderLike = {
  _id: { toString: () => string };
  productId?: { toString: () => string };
  productTitle: string;
  unitPrice: number;
  quantity: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress: string;
  notes?: string;
  status: string;
  createdAt?: string | Date;
};

const normalizeOrder = (order: OrderLike) => ({
  id: order._id.toString(),
  productId: order.productId?.toString() ?? "",
  productTitle: order.productTitle,
  unitPrice: order.unitPrice,
  quantity: order.quantity,
  customerName: order.customerName,
  customerPhone: order.customerPhone ?? "",
  customerEmail: order.customerEmail ?? "",
  shippingAddress: order.shippingAddress,
  notes: order.notes ?? "",
  status: order.status,
  createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : "",
});

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await OrderModel.find({})
      .sort({ createdAt: -1 })
      .lean<OrderLike[]>();
    return NextResponse.json(orders.map(normalizeOrder));
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
