"use server";

import stripe from "@/lib/stripe";
import { CartItem } from "@/store";
import Stripe from "stripe";

// Local address type (replaces Sanity Address)
interface Address {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default?: boolean;
}

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  address?: Address | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata
) {
  try {
    // Retrieve existing customer or create a new one
    const customers = await stripe.customers.list({
      email: metadata.customerEmail,
      limit: 1,
    });
    const customerId = customers?.data?.length > 0 ? customers.data[0].id : "";

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      metadata: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId!,
        address: JSON.stringify(metadata.address),
        utmSource: metadata.utmSource || "",
        utmCampaign: metadata.utmCampaign || "",
        utmMedium: metadata.utmMedium || "",
      },
      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      invoice_creation: {
        enabled: true,
      },
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      line_items: items?.map((item) => ({
        price_data: {
          currency: "USD",
          unit_amount: Math.round(item?.product?.price! * 100),
          product_data: {
            name: item?.product?.name || "Unknown Product",
            description: item?.product?.description ?? undefined,
            metadata: { id: item?.product?._id },
            // Images are plain URLs from DB — no urlFor needed
            images:
              item?.product?.images && item?.product?.images?.length > 0
                ? [item.product.images[0]]
                : undefined,
          },
        },
        quantity: item?.quantity,
      })),
    };
    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = metadata.customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return session.url;
  } catch (error) {
    console.error("Error creating Checkout Session", error);
    throw error;
  }
}
