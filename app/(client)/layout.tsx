import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";
import UtmTracker from "@/components/UtmTracker";
import MetaPixelTracker from "@/components/MetaPixelTracker";

export const metadata: Metadata = {
  title: {
    template: "%s - MaestroShopcart online store",
    default: "Maestro online shop store",
  },
  description:
    "Maestro online shop store, Your one stop shop for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <UtmTracker />
          <MetaPixelTracker />
        </Suspense>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}

/* TEST */