import { db } from "@/lib/db";
import { abandonedCarts, users } from "@/lib/db/schema";
import { eq, and, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Simple security check
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Calculate the threshold date (3 minutes ago)
    const threshold = new Date(Date.now() - 3 * 60 * 1000);

    // 2. Fetch all cart entries abandoned > 3 minutes ago that have NOT received outreach and are NOT recovered
    const pendingOutreach = await db
      .select({
        cartId: abandonedCarts.id,
        productName: abandonedCarts.productName,
        revenue: abandonedCarts.revenue,
        userName: users.name,
        userPhone: users.phone,
      })
      .from(abandonedCarts)
      .innerJoin(users, eq(abandonedCarts.userId, users.id))
      .where(
        and(
          eq(abandonedCarts.recovered, "false"),
          isNull(abandonedCarts.watiMessageSentAt),
          lte(abandonedCarts.abandonedAt, threshold)
        )
      );

    if (pendingOutreach.length === 0) {
      return NextResponse.json({ message: "No abandoned carts requiring outreach at this time." });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
    
    // Automatically detect Vercel production domain or fallback to the live site URL
    const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    const baseUrl = vercelProdUrl || process.env.NEXT_PUBLIC_BASE_URL || "https://ecommerce-theta-teal.vercel.app";

    if (!accountSid || !authToken) {
      console.error("Twilio credentials not configured in environment variables.");
      return NextResponse.json({ error: "Twilio credentials missing" }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const results = [];

    // 3. Process each notification
    for (const item of pendingOutreach) {
      const userPhone = item.userPhone;
      if (!userPhone) {
        continue;
      }

      let formattedPhone = userPhone.trim();
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.length === 10) {
          formattedPhone = "+91" + formattedPhone;
        } else {
          formattedPhone = "+" + formattedPhone;
        }
      }

      // Professional Amazon-style message template
      const customerName = item.userName || "Valued Customer";
      const itemTitle = item.productName || "an item in your cart";
      const itemPrice = item.revenue ? `$${parseFloat(item.revenue).toFixed(2)}` : "your selected price";

      const messageBody = `Dear ${customerName},\n\nWe noticed you left an item in your shopping cart at our store. Secure your order before stock runs out!\n\n📦 *Order Details:*\n• Item: ${itemTitle}\n• Total: ${itemPrice}\n\n🛒 *Complete your purchase now:* ${baseUrl}/cart\n\nThank you for shopping with us!\nCustomer Support Team`;

      try {
        console.log(`Sending WhatsApp outreach to ${formattedPhone} for cart ID: ${item.cartId}`);
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              From: twilioNumber,
              To: `whatsapp:${formattedPhone}`,
              Body: messageBody,
            }).toString(),
          }
        );

        if (response.ok) {
          const resJson = await response.json();
          console.log(`Successfully sent message. Twilio SID: ${resJson.sid}`);

          // Update record with sent timestamp
          await db
            .update(abandonedCarts)
            .set({ watiMessageSentAt: new Date() })
            .where(eq(abandonedCarts.id, item.cartId));

          results.push({ cartId: item.cartId, status: "sent", phone: formattedPhone });
        } else {
          const errText = await response.text();
          console.error(`Twilio API failed with status ${response.status}:`, errText);
          results.push({ cartId: item.cartId, status: "failed", error: errText });
        }
      } catch (err) {
        console.error(`Error sending message for cart ${item.cartId}:`, err);
        results.push({ cartId: item.cartId, status: "error", error: (err as Error).message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    console.error("Cron check-abandoned error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
