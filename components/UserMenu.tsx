"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useOutsideClick } from "@/hooks";
import { LogOut, Shield, ShoppingBag } from "lucide-react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-shop_btn_dark_green text-white hover:opacity-90 transition font-semibold text-sm cursor-pointer"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-lg bg-white p-2 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.role === "admin" && (
              <span className="mt-1 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-2xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                Admin
              </span>
            )}
          </div>

          <div className="py-1">
            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 transition font-medium"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
