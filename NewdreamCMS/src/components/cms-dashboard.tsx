"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/order-status";
import type { CmsOrder, CmsProduct } from "@/types/cms";

type ProductFormState = {
  title: string;
  category: string;
  description: string;
  price: string;
  image: string;
};

const PRODUCT_CATEGORIES = [
  "Office Chairs",
  "Stools",
  "Hospital Chairs",
  "Reception Seating",
];

const initialProductForm: ProductFormState = {
  title: "",
  category: PRODUCT_CATEGORIES[0],
  description: "",
  price: "",
  image: "",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CmsDashboard() {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [orders, setOrders] = useState<CmsOrder[]>([]);
  const [activeView, setActiveView] = useState<"products" | "orders">(
    "products"
  );
  const [productForm, setProductForm] =
    useState<ProductFormState>(initialProductForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const orderStats = useMemo(() => {
    return ORDER_STATUSES.reduce(
      (acc, status) => {
        acc[status] = orders.filter((order) => order.status === status).length;
        return acc;
      },
      {} as Record<OrderStatus, number>
    );
  }, [orders]);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);

      if (!productsResponse.ok || !ordersResponse.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const [productsPayload, ordersPayload] = await Promise.all([
        productsResponse.json(),
        ordersResponse.json(),
      ]);

      setProducts(productsPayload);
      setOrders(ordersPayload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data.";
      setNotice(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSavingProduct(true);
    setNotice("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create product.");
      }

      setProductForm(initialProductForm);
      setNotice("Product added successfully. It is now visible on storefront.");
      await loadDashboardData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create product.";
      setNotice(message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setStatusUpdatingId(orderId);
    setNotice("");

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update order status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      setNotice(`Order updated to ${ORDER_STATUS_LABELS[status]}.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update order status.";
      setNotice(message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 md:px-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="cms-shell p-6 sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.26em] text-[#5c6ba4] sm:text-sm">
          NewDream CMS
        </p>
        <h1 className="font-display mt-4 text-3xl leading-tight text-[#1f2e4f] sm:text-5xl">
          Manage products and delivery progress from one control center.
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-[#394d78] sm:text-base">
          Add furniture items with title, description, and price. Track orders
          from placed to delivered and keep storefront data live.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveView("products")}
            className={`cms-pill ${
              activeView === "products"
                ? "bg-[#1f2e4f] text-white"
                : "bg-white/75 text-[#1f2e4f]"
            }`}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setActiveView("orders")}
            className={`cms-pill ${
              activeView === "orders"
                ? "bg-[#1f2e4f] text-white"
                : "bg-white/75 text-[#1f2e4f]"
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => void loadDashboardData()}
            className="cms-pill bg-[#6e80bb] text-white"
          >
            Refresh
          </button>
        </div>
      </motion.section>

      {notice && (
        <div className="cms-shell border-[#95a5db]/35 bg-white/80 px-4 py-3 text-sm text-[#243458]">
          {notice}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="cms-shell p-5 sm:p-6">
          {activeView === "products" ? (
            <div>
              <h2 className="font-display text-2xl text-[#22325a] sm:text-3xl">
                Add product
              </h2>
              <form className="mt-4 grid gap-3" onSubmit={handleProductSubmit}>
                <input
                  required
                  placeholder="Item title"
                  value={productForm.title}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="cms-input"
                />
                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="cms-input"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <textarea
                  required
                  placeholder="Description"
                  rows={4}
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="cms-input resize-none"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Price (INR)"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className="cms-input"
                  />
                  <input
                    placeholder="Image URL (optional)"
                    value={productForm.image}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                    className="cms-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="mt-2 rounded-full bg-[#1f2e4f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#192541] disabled:cursor-not-allowed disabled:bg-[#7582aa]"
                >
                  {isSavingProduct ? "Saving product..." : "Add product"}
                </button>
              </form>

              <h3 className="font-display mt-8 text-xl text-[#22325a]">
                Product list
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-white/80 bg-white/72 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-[#5974bf]">
                      {product.category}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-[#22325a]">
                      {product.title}
                    </h4>
                    <p className="mt-2 text-sm text-[#3f5485]">
                      {product.description}
                    </p>
                    <p className="mt-3 text-base font-semibold text-[#22325a]">
                      {formatCurrency(product.price)}
                    </p>
                  </article>
                ))}

                {!isLoading && products.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#8fa2e4] bg-white/65 p-4 text-sm text-[#3f5485]">
                    No products yet. Add your first furniture item now.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-2xl text-[#22325a] sm:text-3xl">
                Orders and status flow
              </h2>
              <p className="mt-2 text-sm text-[#3f5485]">
                Update each order from placed to delivered.
              </p>

              <div className="mt-4 grid gap-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-white/80 bg-white/75 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#5974bf]">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-[#22325a]">
                          {order.productTitle}
                        </h4>
                        <p className="mt-1 text-sm text-[#3f5485]">
                          {order.customerName} | Qty {order.quantity} |{" "}
                          {formatCurrency(order.unitPrice * order.quantity)}
                        </p>
                        <p className="mt-1 text-sm text-[#3f5485]">
                          {order.shippingAddress}
                        </p>
                      </div>

                      <select
                        value={order.status}
                        disabled={statusUpdatingId === order.id}
                        onChange={(event) =>
                          void updateOrderStatus(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="cms-input w-full sm:w-52"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}

                {!isLoading && orders.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[#8fa2e4] bg-white/65 p-4 text-sm text-[#3f5485]">
                    No orders yet. Orders placed on storefront will appear here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="cms-shell p-5 sm:p-6">
          <h2 className="font-display text-2xl text-[#22325a]">Snapshot</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="rounded-xl bg-white/72 px-3 py-2 text-[#31456f]">
              Total products: <strong>{products.length}</strong>
            </div>
            <div className="rounded-xl bg-white/72 px-3 py-2 text-[#31456f]">
              Total orders: <strong>{orders.length}</strong>
            </div>
            {ORDER_STATUSES.map((status) => (
              <div
                key={status}
                className="rounded-xl bg-white/72 px-3 py-2 text-[#31456f]"
              >
                {ORDER_STATUS_LABELS[status]}: <strong>{orderStats[status] ?? 0}</strong>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-[#3f5485]">
            Tip: Keep status updates frequent so customers can track progress
            from in-process to delivered without confusion.
          </p>
        </aside>
      </section>
    </main>
  );
}
