import React from "react";
import { db } from "@/lib/db";
import { metaEvents } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShoppingCart, Award, Eye, Calendar, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MetaPixelDashboardPage() {
  // Query all logged Meta Pixel events
  const loggedEvents = await db
    .select()
    .from(metaEvents)
    .orderBy(desc(metaEvents.createdAt))
    .limit(100);

  // Group events count
  const countsQuery = await db
    .select({
      eventName: metaEvents.eventName,
      count: sql<number>`cast(count(${metaEvents.id}) as int)`,
    })
    .from(metaEvents)
    .groupBy(metaEvents.eventName);

  const stats = {
    total: loggedEvents.length,
    pageView: 0,
    addToCart: 0,
    purchase: 0,
    addToWishlist: 0,
    initiateCheckout: 0,
  };

  countsQuery.forEach((stat) => {
    const name = stat.eventName.toLowerCase();
    if (name === "pageview") stats.pageView = stat.count;
    else if (name === "addtocart") stats.addToCart = stat.count;
    else if (name === "purchase") stats.purchase = stat.count;
    else if (name === "addtowishlist") stats.addToWishlist = stat.count;
    else if (name === "initiatecheckout") stats.initiateCheckout = stat.count;
  });

  // Calculate percentages for SVG bar graph
  const maxVal = Math.max(stats.pageView, stats.addToCart, stats.purchase, stats.addToWishlist, stats.initiateCheckout, 1);
  const getPercent = (val: number) => (val / maxVal) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meta Pixel Analytics</h1>
        <p className="text-slate-500 mt-1">Real-time tracking of marketing events and customer actions.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Tracking Signals</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-400 mt-1">All events collected</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pageView}</div>
            <p className="text-xs text-slate-400 mt-1">Traffic signals tracked</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Add to Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.addToCart}</div>
            <p className="text-xs text-slate-400 mt-1">Shopping intent captures</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Completed Purchases</CardTitle>
            <Award className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.purchase}</div>
            <p className="text-xs text-slate-400 mt-1">Successful sales conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Bar Chart (SVG-based) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Event Volume Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "PageView", val: stats.pageView, color: "bg-sky-500" },
            { label: "AddToWishlist", val: stats.addToWishlist, color: "bg-purple-500" },
            { label: "AddToCart", val: stats.addToCart, color: "bg-amber-500" },
            { label: "InitiateCheckout", val: stats.initiateCheckout, color: "bg-indigo-500" },
            { label: "Purchase", val: stats.purchase, color: "bg-rose-500" },
          ].map((bar, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{bar.label}</span>
                <span className="font-semibold text-slate-900">{bar.val} signals</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                  style={{ width: `${getPercent(bar.val)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Events Log Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Pixel Event Stream (Recent 100)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-medium">
                  <th className="p-4">Event Name</th>
                  <th className="p-4">Location URL</th>
                  <th className="p-4">Parameter Payload</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loggedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No pixel events recorded yet. Browse the shop to fire events.
                    </td>
                  </tr>
                ) : (
                  loggedEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-semibold text-slate-900">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          evt.eventName.toLowerCase() === "pageview" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                          evt.eventName.toLowerCase() === "addtocart" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          evt.eventName.toLowerCase() === "purchase" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          evt.eventName.toLowerCase() === "addtowishlist" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                          "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}>
                          {evt.eventName}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-xs break-all max-w-xs md:max-w-md">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                          {evt.url}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs max-w-xs break-words">
                        {evt.payload ? (
                          <span className="block bg-slate-50 p-1.5 rounded border border-slate-100 max-h-20 overflow-y-auto">
                            {evt.payload}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">none</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(evt.createdAt).toLocaleString("en-US")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
