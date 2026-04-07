import type { OrderStatus } from "@/lib/order-status";

export type CmsProduct = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  image: string;
  isActive: boolean;
  createdAt: string;
};

export type CmsOrder = {
  id: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes: string;
  status: OrderStatus;
  createdAt: string;
};
