// Local order type matching the DB query shape from orders page
export interface DbOrderItem {
  id: string;
  quantity: number;
  price: string;
  productName: string | null;
  productImage: string[] | null;
  productSlug: string | null;
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  totalPrice: string;
  status: string;
  stripeSessionId: string | null;
  items: DbOrderItem[];
}
