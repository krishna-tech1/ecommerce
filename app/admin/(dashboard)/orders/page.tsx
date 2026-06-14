import React from "react";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PriceFormatter from "@/components/PriceFormatter";
import StatusDropdown from "./StatusDropdown";

export default async function AdminOrdersPage() {
  const dbOrders = await db
    .select()
    .from(orders)
    .orderBy(sql`created_at desc`);

  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    dbOrders.map(async (o) => {
      const items = await db
        .select({
          quantity: orderItems.quantity,
          price: orderItems.price,
          productName: products.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, o.id));

      return {
        ...o,
        items,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage and track customer orders</p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products Bought</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersWithItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              ordersWithItems.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ul className="text-xs list-disc pl-4 space-y-0.5">
                      {o.items.map((item, idx) => (
                        <li key={idx}>
                          {item.productName || "Product"} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <PriceFormatter amount={Number(o.totalPrice)} />
                  </TableCell>
                  <TableCell>
                    <StatusDropdown orderId={o.id} currentStatus={o.status} />
                  </TableCell>
                  <TableCell className="text-xs">{o.createdAt?.toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
