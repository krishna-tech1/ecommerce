import { db } from "@/lib/db";
import { abandonedCarts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, productName, productPrice, utmSource, utmCampaign } = await req.json();

    if (!userId || !productName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Retrieve user details (name, phone)
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Insert abandoned cart entry
    const [cart] = await db
      .insert(abandonedCarts)
      .values({
        userId,
        revenue: productPrice.toString(),
        recovered: "false",
        utmSource: utmSource || null,
        utmCampaign: utmCampaign || null,
      })
      .returning();

    // Trigger the 3-minute WhatsApp outreach timer (3 * 60 * 1000 ms)
    const delay = 3 * 60 * 1000;
    setTimeout(async () => {
      try {
        // Fetch cart status to see if it was recovered in the interim
        const [updatedCart] = await db
          .select()
          .from(abandonedCarts)
          .where(eq(abandonedCarts.id, cart.id));

        if (updatedCart && updatedCart.recovered === "false") {
          const userPhone = user.phone;
          if (userPhone) {
            let formattedPhone = userPhone.trim();
            if (!formattedPhone.startsWith("+")) {
              if (formattedPhone.length === 10) {
                formattedPhone = "+91" + formattedPhone;
              } else {
                formattedPhone = "+" + formattedPhone;
              }
            }

            console.log(`Sending Twilio WhatsApp message to: ${formattedPhone} for product: ${productName}`);

            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

            if (accountSid && authToken) {
              const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
              const messageBody = `Hello ${user.name || "Customer"}, you left ${productName} ($${productPrice}) in your cart! Complete your purchase now at: http://localhost:3000/cart`;

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
                console.log("Twilio WhatsApp message sent successfully:", resJson.sid);

                // Update cart record to log outreach timestamp
                await db
                  .update(abandonedCarts)
                  .set({ watiMessageSentAt: new Date() })
                  .where(eq(abandonedCarts.id, cart.id));
              } else {
                const errText = await response.text();
                console.error("Twilio API failed with status:", response.status, errText);
              }
            } else {
              console.error("Twilio credentials not configured in env");
            }
          } else {
            console.log("User has no phone number associated. Skipping WhatsApp notification.");
          }
        } else {
          console.log(`Cart ${cart.id} was already recovered. Skipping outreach.`);
        }
      } catch (err) {
        console.error("Error running abandoned cart WhatsApp outreach:", err);
      }
    }, delay);

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (err) {
    console.error("Error registering add-to-cart event:", err);
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
