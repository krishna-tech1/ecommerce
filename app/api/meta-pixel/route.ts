import { db } from "@/lib/db";
import { metaEvents } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, url, payload } = body;

    if (!eventName || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const stringifiedPayload = payload ? JSON.stringify(payload) : null;

    await db.insert(metaEvents).values({
      eventName,
      url,
      payload: stringifiedPayload,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging Meta Pixel event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
