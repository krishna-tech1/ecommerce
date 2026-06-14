import { db } from "@/lib/db";
import { metaEvents, abandonedCarts, users, orders } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Granular Conversion Funnel Data (using real db logs)
    const funnelResult = await db
      .select({
        eventName: metaEvents.eventName,
        count: sql<number>`cast(count(${metaEvents.id}) as int)`,
      })
      .from(metaEvents)
      .groupBy(metaEvents.eventName);

    const funnelMap = {
      PageView: 0,
      ViewContent: 0,
      AddToCart: 0,
      InitiateCheckout: 0,
      Purchase: 0,
    };

    funnelResult.forEach((row) => {
      const name = row.eventName as keyof typeof funnelMap;
      if (name in funnelMap) {
        funnelMap[name] = row.count;
      }
    });

    const funnelData = [
      { step: "Product Views", count: funnelMap.ViewContent },
      { step: "Add to Carts", count: funnelMap.AddToCart },
      { step: "Checkouts Initiated", count: funnelMap.InitiateCheckout },
      { step: "Purchases", count: funnelMap.Purchase },
    ];

    // 2. WATI (WhatsApp) Recovery ROI (using real db logs)
    const watiQuery = await db
      .select({
        recovered: abandonedCarts.recovered,
        count: sql<number>`cast(count(${abandonedCarts.id}) as int)`,
        revenueSum: sql<number>`cast(sum(${abandonedCarts.revenue}) as float)`,
      })
      .from(abandonedCarts)
      .where(sql`${abandonedCarts.watiMessageSentAt} is not null`)
      .groupBy(abandonedCarts.recovered);

    let recoveredCarts = 0;
    let totalWatiSent = 0;
    let revenueSaved = 0;

    watiQuery.forEach((row) => {
      totalWatiSent += row.count;
      if (row.recovered === "true") {
        recoveredCarts = row.count;
        revenueSaved = row.revenueSum || 0;
      }
    });

    const recoveryRate = totalWatiSent > 0 ? (recoveredCarts / totalWatiSent) * 100 : 0;

    // 3. Customer Lifetime Value (LTV) by UTM Source (using real orders joined with acquisition UTMs)
    const ltvResult = await db
      .select({
        utmSource: users.utmSource,
        utmCampaign: users.utmCampaign,
        totalSpend: sql<number>`cast(sum(${orders.totalPrice}) as float)`,
      })
      .from(users)
      .innerJoin(orders, eq(orders.userId, users.id))
      .groupBy(users.utmSource, users.utmCampaign);

    const ltvData = ltvResult.map((row) => ({
      source: row.utmSource || "Direct",
      campaign: row.utmCampaign || "Organic",
      ltv: row.totalSpend || 0,
    }));

    // 4. Cohort Retention Heatmap (dynamically calculated from registration utmCampaign and order dates)
    const campaignUsers = await db
      .select({
        id: users.id,
        utmCampaign: users.utmCampaign,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(sql`${users.utmCampaign} is not null`);

    const campaignUserIds = campaignUsers.map((u) => u.id);
    let cohortOrders: { userId: string | null; createdAt: Date }[] = [];
    
    if (campaignUserIds.length > 0) {
      cohortOrders = await db
        .select({
          userId: orders.userId,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(inArray(orders.userId, campaignUserIds)) as { userId: string | null; createdAt: Date }[];
    }

    const campaignGroups: Record<string, typeof campaignUsers> = {};
    campaignUsers.forEach((u) => {
      const camp = u.utmCampaign || "none";
      if (!campaignGroups[camp]) {
        campaignGroups[camp] = [];
      }
      campaignGroups[camp].push(u);
    });

    const cohortData = Object.entries(campaignGroups).map(([campaign, uList]) => {
      const cohortSize = uList.length;
      const uIdsSet = new Set(uList.map((u) => u.id));

      const cohortOrdersFiltered = cohortOrders.filter(
        (o) => o.userId && uIdsSet.has(o.userId)
      );

      const m1Users = new Set<string>();
      const m2Users = new Set<string>();
      const m3Users = new Set<string>();

      uList.forEach((u) => {
        const regDate = new Date(u.createdAt);
        const userOrders = cohortOrdersFiltered.filter((o) => o.userId === u.id);

        userOrders.forEach((o) => {
          const ordDate = new Date(o.createdAt);
          const diffTime = ordDate.getTime() - regDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (diffDays >= 0 && diffDays <= 30) {
            m1Users.add(u.id);
          } else if (diffDays > 30 && diffDays <= 60) {
            m2Users.add(u.id);
          } else if (diffDays > 60 && diffDays <= 90) {
            m3Users.add(u.id);
          }
        });
      });

      const m1 = cohortSize > 0 ? Math.round((m1Users.size / cohortSize) * 100) : 0;
      const m2 = cohortSize > 0 ? Math.round((m2Users.size / cohortSize) * 100) : 0;
      const m3 = cohortSize > 0 ? Math.round((m3Users.size / cohortSize) * 100) : 0;

      return {
        campaign,
        cohortSize,
        m1,
        m2,
        m3,
      };
    });

    return NextResponse.json({
      funnelData,
      watiStats: {
        totalWatiSent,
        recoveredCarts,
        revenueSaved,
        recoveryRate: parseFloat(recoveryRate.toFixed(2)),
      },
      ltvData,
      cohortData,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
