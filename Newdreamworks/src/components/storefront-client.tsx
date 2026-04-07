"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import type { ProductCard } from "@/types/storefront";

type StorefrontClientProps = {
  products: ProductCard[];
  usesLiveProducts: boolean;
};

type OrderFormState = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  quantity: number;
  notes: string;
};

const initialForm: OrderFormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  shippingAddress: "",
  quantity: 1,
  notes: "",
};

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:3001";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function StorefrontClient({
  products,
  usesLiveProducts,
}: StorefrontClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products[0]?.id ?? null
  );
  const [formState, setFormState] = useState<OrderFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const categories = useMemo(
    () => ["All", ...new Set(products.map((item) => item.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products;
    }

    return products.filter((item) => item.category === activeCategory);
  }, [activeCategory, products]);

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const handleOrderSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!usesLiveProducts || !selectedProduct) {
      setFeedbackMessage(
        "Add real products in CMS first. Demo products are view-only."
      );
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: Number(formState.quantity),
          customerName: formState.customerName,
          customerPhone: formState.customerPhone,
          customerEmail: formState.customerEmail,
          shippingAddress: formState.shippingAddress,
          notes: formState.notes,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to place order.");
      }

      setFormState(initialForm);
      setFeedbackMessage(
        "Order placed successfully. Track and update status from your CMS dashboard."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to place order.";
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 md:px-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-card overflow-hidden p-6 sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-rose-500 sm:text-sm">
          NewDream Works
        </p>
        <h1 className="font-display mt-4 text-3xl leading-tight text-[#3f2736] sm:text-5xl">
          Furniture crafted for offices, clinics, and modern spaces.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-[#5f4253] sm:text-base">
          Discover premium office chairs, stools, and hospital seating with
          durable builds and elegant comfort. Products added in the CMS appear
          here instantly.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#products" className="pill-button bg-[#3f2736] text-white">
            Explore products
          </a>
          <a
            href={CMS_URL}
            target="_blank"
            rel="noreferrer"
            className="pill-button bg-white/70 text-[#3f2736]"
          >
            Open CMS dashboard
          </a>
        </div>
      </motion.section>

      <AnimatePresence>
        {!usesLiveProducts && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card border-dashed border-[#f57799]/50 p-4 text-sm text-[#5f4253]"
          >
            Demo products are shown right now. Add products in your CMS to
            accept real orders.
          </motion.div>
        )}
      </AnimatePresence>

      <section id="products" className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="glass-card p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-2xl text-[#412738] sm:text-3xl">
              Product collection
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition sm:text-sm ${
                    activeCategory === category
                      ? "bg-[#3f2736] text-white"
                      : "bg-white/70 text-[#4b3444] hover:bg-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="flex min-h-56 flex-col rounded-3xl border border-white/60 bg-white/65 p-4 backdrop-blur-lg"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#d34d7a]">
                  {product.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#402b3a]">
                  {product.title}
                </h3>
                <p className="mt-2 text-sm text-[#5f4253]">
                  {product.description}
                </p>
                <div className="mt-auto flex items-end justify-between pt-4">
                  <p className="text-lg font-semibold text-[#402b3a]">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    type="button"
                    disabled={!usesLiveProducts}
                    onClick={() => setSelectedProductId(product.id)}
                    className="rounded-full bg-[#f57799] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#de5b83] disabled:cursor-not-allowed disabled:bg-[#f9c2d1]"
                  >
                    {usesLiveProducts ? "Order now" : "CMS needed"}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <h2 className="font-display text-2xl text-[#402b3a]">Quick order</h2>
          <p className="mt-2 text-sm text-[#5f4253]">
            {selectedProduct
              ? `Selected: ${selectedProduct.title}`
              : "Select a product to place an order."}
          </p>

          {usesLiveProducts && selectedProduct ? (
            <form className="mt-4 grid gap-3" onSubmit={handleOrderSubmit}>
              <input
                required
                placeholder="Customer name"
                value={formState.customerName}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    customerName: event.target.value,
                  }))
                }
                className="input-style"
              />
              <input
                placeholder="Phone"
                value={formState.customerPhone}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    customerPhone: event.target.value,
                  }))
                }
                className="input-style"
              />
              <input
                type="email"
                placeholder="Email"
                value={formState.customerEmail}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    customerEmail: event.target.value,
                  }))
                }
                className="input-style"
              />
              <textarea
                required
                placeholder="Shipping address"
                value={formState.shippingAddress}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    shippingAddress: event.target.value,
                  }))
                }
                rows={3}
                className="input-style resize-none"
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <textarea
                  placeholder="Order notes"
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={2}
                  className="input-style resize-none"
                />
                <input
                  type="number"
                  min={1}
                  value={formState.quantity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      quantity: Number(event.target.value || 1),
                    }))
                  }
                  className="input-style w-20 text-center"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-[#3f2736] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f1f2a] disabled:cursor-not-allowed disabled:bg-[#8f7283]"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 p-4 text-sm text-[#5f4253]">
              Add real products from the CMS to activate checkout on this
              storefront.
            </div>
          )}

          {feedbackMessage && (
            <p className="mt-4 rounded-2xl border border-[#f57799]/40 bg-white/70 px-3 py-2 text-sm text-[#4c3444]">
              {feedbackMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
