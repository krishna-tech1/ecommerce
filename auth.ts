import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Phone and OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "text" },
        utmSource: { label: "UtmSource", type: "text" },
        utmCampaign: { label: "UtmCampaign", type: "text" },
        utmMedium: { label: "UtmMedium", type: "text" },
        role: { label: "Role", type: "text" },
      },
      authorize: async (credentials) => {
        const phone = credentials?.phone as string;
        const otp = credentials?.otp as string;
        const name = credentials?.name as string;
        const email = credentials?.email as string;
        const utmSource = credentials?.utmSource as string;
        const utmCampaign = credentials?.utmCampaign as string;
        const utmMedium = credentials?.utmMedium as string;
        const requestedRole = (credentials?.role as string) || "user";

        if (!phone || !otp) {
          throw new Error("Phone number and OTP are required");
        }

        if (!/^\d{6}$/.test(otp)) {
          throw new Error("OTP must be a 6-digit number");
        }

        // Query user from Neon database by phone
        let [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

        if (!user) {
          const allUsers = await db.select({ id: users.id }).from(users).limit(1);
          
          if (requestedRole === "admin") {
            // Only allow creating an admin if the database has absolutely no users
            if (allUsers.length > 0) {
              throw new Error("Unauthorized. Only existing administrators can log in here.");
            }
          }

          const actualRole = allUsers.length === 0 ? "admin" : "user";
          const finalName = name || "New User";
          const finalEmail = email || `user_${Date.now()}@example.com`;
          const [inserted] = await db
            .insert(users)
            .values({
              phone,
              name: finalName,
              email: finalEmail,
              password: "",
              role: actualRole,
              utmSource: utmSource || null,
              utmCampaign: utmCampaign || null,
              utmMedium: utmMedium || null,
            })
            .returning();
          
          user = inserted;
        } else {
          // User exists. Update name and email if new values provided
          const updates: Record<string, any> = {};
          if (name && (!user.name || user.name === "New User")) {
            updates.name = name;
          }
          if (email && (!user.email || user.email.includes("example.com"))) {
            updates.email = email;
          }
          if (Object.keys(updates).length > 0) {
            const [updated] = await db
              .update(users)
              .set(updates)
              .where(eq(users.id, user.id))
              .returning();
            user = updated;
          }

          // If logging in via admin flow, block if the user is not an admin
          if (requestedRole === "admin" && user.role !== "admin") {
            throw new Error("Unauthorized. Admin access required.");
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email || `${phone}@example.com`,
          role: user.role,
        };
      },
    }),
  ],
});
