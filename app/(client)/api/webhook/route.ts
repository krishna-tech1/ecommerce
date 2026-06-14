import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, orderItems, products, abandonedCarts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { Metadata } from "@/actions/createCheckoutSession";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "No Signature found for stripe" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      { error: "Stripe webhook secret is not set" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await createOrderInDatabase(session);
    } catch (error) {
      console.error("Error creating order in database:", error);
      return NextResponse.json(
        { error: `Error creating order: ${error}` },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderInDatabase(session: Stripe.Checkout.Session) {
  const {
    id,
    amount_total,
    metadata,
  } = session;

  const { orderNumber, customerName, customerEmail, clerkUserId, utmSource, utmCampaign, utmMedium } =
    metadata as unknown as Metadata;

  // Retrieve checkout session line items
  const lineItems = await stripe.checkout.sessions.listLineItems(id, {
    expand: ["data.price.product"],
  });

  // Start database transaction
  await db.transaction(async (tx) => {
    // 1. Create order record
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId: clerkUserId || null,
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "unknown@example.com",
        totalPrice: amount_total ? (amount_total / 100).toString() : "0.00",
        status: "paid",
        stripeSessionId: id,
        utmSource: utmSource || null,
        utmCampaign: utmCampaign || null,
        utmMedium: utmMedium || null,
      })
      .returning();

    // 1b. Mark abandoned cart as recovered
    if (clerkUserId) {
      await tx
        .update(abandonedCarts)
        .set({ recovered: "true" })
        .where(eq(abandonedCarts.userId, clerkUserId));
    }

    // 2. Process each purchased item
    for (const item of lineItems.data) {
      const productId = (item.price?.product as Stripe.Product)?.metadata?.id;
      const quantity = item.quantity || 0;
      const price = item.price?.unit_amount ? (item.price.unit_amount / 100).toString() : "0.00";

      if (!productId) continue;

      // Create order_item
      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: productId,
        quantity: quantity,
        price: price,
      });

      // Update product inventory stock
      await tx
        .update(products)
        .set({
          stock: sql`GREATEST(${products.stock} - ${quantity}, 0)`,
        })
        .where(eq(products.id, productId));
    }
  });
}
