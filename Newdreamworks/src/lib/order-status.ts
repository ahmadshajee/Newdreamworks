export const ORDER_STATUSES = [
  "placed",
  "inprocess",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
