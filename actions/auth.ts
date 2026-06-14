"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function checkPhoneRegistration(phone: string) {
  if (!phone) return { exists: false, hasName: false, name: null };
  try {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return {
      exists: !!user,
      hasName: !!user && !!user.name && user.name !== "New User",
      name: user ? user.name : null,
    };
  } catch (error) {
    console.error(error);
    return { exists: false, hasName: false, name: null };
  }
}

export async function loginWithPhoneOtp(prevState: any, formData: FormData) {
  const phone = formData.get("phone") as string;
  const otp = formData.get("otp") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const utmSource = formData.get("utmSource") as string;
  const utmCampaign = formData.get("utmCampaign") as string;
  const utmMedium = formData.get("utmMedium") as string;
  const role = formData.get("role") as string || "user";

  if (!phone || !otp) {
    return { error: "Phone number and OTP are required" };
  }

  try {
    await signIn("credentials", {
      phone,
      otp,
      name: name || "",
      email: email || "",
      utmSource: utmSource || "",
      utmCampaign: utmCampaign || "",
      utmMedium: utmMedium || "",
      role,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message || "Invalid credentials." };
    }
    throw error;
  }
}
