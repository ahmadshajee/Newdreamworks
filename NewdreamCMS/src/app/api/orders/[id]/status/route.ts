import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { ORDER_STATUSES } from "@/lib/order-status";
import { connectToDatabase } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StatusPayload = {
  status?: string;
};

type ValidStatus = (typeof ORDER_STATUSES)[number];

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
    }

    const body = (await request.json()) as StatusPayload;
    const status = body.status as ValidStatus | undefined;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id.toString(),
      status: updated.status,
    });
  } catch (error) {
    console.error("Failed to update order status", error);
    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
