import { InferSchemaType, Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2 },
    category: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, required: true, trim: true, minlength: 10 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

const ProductModel = models.Product || model("Product", productSchema);

export default ProductModel;
