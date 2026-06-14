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

    // Retrieve user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Insert abandoned cart entry with productName
    const [cart] = await db
      .insert(abandonedCarts)
      .values({
        userId,
        productName,
        revenue: productPrice.toString(),
        recovered: "false",
        utmSource: utmSource || null,
        utmCampaign: utmCampaign || null,
      })
      .returning();

    return NextResponse.json({ success: true, cartId: cart.id });
  } catch (err) {
    console.error("Error registering add-to-cart event:", err);
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
