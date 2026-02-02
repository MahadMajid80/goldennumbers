import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = req.nextUrl.pathname === "/admin/login";

    if (isLoginPage && isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (isAdminRoute && !isLoginPage && !isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const isLoginPage = req.nextUrl.pathname === "/admin/login";
        
        if (isLoginPage) {
          return true;
        }
        
        if (isAdminRoute) {
          return token?.role === "admin";
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};

