import React from "react";
import Container from "./Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import SignIn from "./SignIn";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import { auth } from "@/auth";
import Link from "next/link";
import { Logs } from "lucide-react";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const Header = async () => {
  const session = await auth();
  const user = session?.user;
  const userId = (user as { id?: string })?.id;

  let orderCount = 0;
  if (userId) {
    try {
      const userOrders = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.userId, userId));
      orderCount = userOrders.length;
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  }

  return (
    <header className="sticky top-0 z-50 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
      <Container className="flex items-center justify-between text-lightColor">
        <div className="w-auto md:w-1/3 flex items-center gap-2.5 justify-start md:gap-0">
          <MobileMenu />
          <Logo />
        </div>
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5">
          <SearchBar />
          <CartIcon />
          <FavoriteButton />

          {user && (
            <Link
              href={"/orders"}
              className="group relative hover:text-shop_light_green hoverEffect"
            >
              <SidebarIcon />
              <span className="absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
              {orderCount > 0 ? orderCount : 0}
              </span>
            </Link>
          )}

          {user ? (
            <UserMenu user={user} />
          ) : (
            <SignIn />
          )}
        </div>
      </Container>
    </header>
  );
};

// Simple wrapper for standard Logs icon
const SidebarIcon = () => <Logs />;

export default Header;
