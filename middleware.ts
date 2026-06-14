import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect /admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (nextUrl.pathname === "/admin/login") {
      return;
    }
    const role = (req.auth?.user as any)?.role;
    if (!isLoggedIn || role !== "admin") {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
  }

  // Protect /orders and /wishlist routes
  if (nextUrl.pathname.startsWith("/orders") || nextUrl.pathname.startsWith("/wishlist")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/sign-in", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*", "/wishlist/:path*"],
};