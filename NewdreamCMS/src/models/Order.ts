import { InferSchemaType, Schema, model, models } from "mongoose";
import { ORDER_STATUSES } from "@/lib/order-status";

const orderSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productTitle: { type: String, required: true, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true, default: "" },
    customerEmail: { type: String, trim: true, default: "" },
    shippingAddress: { type: String, required: true, trim: true },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "placed",
      required: true,
    },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

const OrderModel = models.Order || model("Order", orderSchema);

export default OrderModel;
