"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, DollarSign, MessageSquare, Percent, Users } from "lucide-react";
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

interface FunnelStep {
  step: string;
  count: number;
}

interface LtvItem {
  source: string;
  campaign: string;
  ltv: number;
}

interface CohortItem {
  campaign: string;
  cohortSize: number;
  m1: number;
  m2: number;
  m3: number;
}

interface AnalyticsData {
  funnelData: FunnelStep[];
  watiStats: {
    totalWatiSent: number;
    recoveredCarts: number;
    revenueSaved: number;
    recoveryRate: number;
  };
  ltvData: LtvItem[];
  cohortData: CohortItem[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load analytics data");
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="h-4 w-96 bg-slate-200" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full bg-slate-200" />
          <Skeleton className="h-[400px] w-full bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
        <p className="text-slate-500 max-w-sm">{error || "Ensure you are logged in with admin privileges."}</p>
      </div>
    );
  }

  // Calculate funnel drop-off percentages
  const funnelWithDropoff = data.funnelData.map((item, idx, arr) => {
    const prev = arr[idx - 1];
    const dropoff = prev ? ((prev.count - item.count) / prev.count) * 100 : 0;
    const conversion = arr[0] ? (item.count / arr[0].count) * 100 : 0;
    return {
      ...item,
      dropoff: parseFloat(dropoff.toFixed(1)),
      conversion: parseFloat(conversion.toFixed(1)),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Advanced Analytics Portal</h1>
        <p className="text-slate-500 mt-1">Granular conversions, WhatsApp recovery ROI, LTV distribution, and retention.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">WATI Saved Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ${data.watiStats.revenueSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> ROI Active
              </span>
              Recovered sales
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">WhatsApp Recovery Rate</CardTitle>
            <Percent className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.watiStats.recoveryRate}%</div>
            <p className="text-xs text-slate-400 mt-1">
              {data.watiStats.recoveredCarts} of {data.watiStats.totalWatiSent} recovered
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">WATI Notifications Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.watiStats.totalWatiSent}</div>
            <p className="text-xs text-slate-400 mt-1">Automated WhatsApp recovery messages</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Funnel Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {funnelWithDropoff[funnelWithDropoff.length - 1]?.conversion}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Total visitor-to-purchaser ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Funnel Chart */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Granular Conversion Funnel</CardTitle>
            <CardDescription>Drop-off percentages step-by-step from product views to conversion</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelWithDropoff} layout="vertical" margin={{ left: 30, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="step" type="category" width={120} />
                <Tooltip
                  formatter={(value) => [`${value} actions`, "Volume"]}
                  contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1" }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LTV by UTM Source */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Customer LTV by UTM Campaign</CardTitle>
            <CardDescription>Aggregation of total customer lifetime value per traffic channel</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ltvData} margin={{ left: 10, right: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" angle={-15} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "LTV Spend"]}
                  contentStyle={{ background: "#ffffff", border: "1px solid #cbd5e1" }}
                />
                <Legend />
                <Bar name="LTV ($)" dataKey="ltv" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Retention Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Campaign Cohort Retention Heatmap</CardTitle>
          <CardDescription>Repeat purchase retention rates of users acquired via marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 font-medium">
                  <th className="p-4">UTM Campaign</th>
                  <th className="p-4 text-center">Cohort Size</th>
                  <th className="p-4 text-center">Month 1 (Reg)</th>
                  <th className="p-4 text-center">Month 2 (Ret)</th>
                  <th className="p-4 text-center">Month 3 (Ret)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.cohortData.map((cohort, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-900">{cohort.campaign}</td>
                    <td className="p-4 text-center text-slate-600 font-medium">{cohort.cohortSize} users</td>
                    
                    {/* Month 1 */}
                    <td className="p-2 text-center">
                      <div className="mx-auto flex h-10 w-24 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-xs shadow">
                        {cohort.m1}%
                      </div>
                    </td>
                    
                    {/* Month 2 */}
                    <td className="p-2 text-center">
                      <div className={`mx-auto flex h-10 w-24 items-center justify-center rounded-lg font-bold text-xs shadow ${
                        cohort.m2 >= 50 ? "bg-emerald-400 text-white" :
                        cohort.m2 >= 30 ? "bg-emerald-200 text-emerald-800" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {cohort.m2}%
                      </div>
                    </td>

                    {/* Month 3 */}
                    <td className="p-2 text-center">
                      <div className={`mx-auto flex h-10 w-24 items-center justify-center rounded-lg font-bold text-xs shadow ${
                        cohort.m3 >= 40 ? "bg-emerald-400 text-white" :
                        cohort.m3 >= 20 ? "bg-emerald-200 text-emerald-800" :
                        "bg-emerald-50 text-emerald-600"
                      }`}>
                        {cohort.m3}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
