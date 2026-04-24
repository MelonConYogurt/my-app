import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  function redirectByRole(role: string) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  const isAuth = !!token;

  if (pathname === "/login") {
    return isAuth
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/dashboard" || pathname === "/") {
    switch (token.role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin", request.url));

      case "student":
        return NextResponse.redirect(new URL("/student", request.url));

      case "docent":
        return NextResponse.redirect(new URL("/docent", request.url));
    }
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return redirectByRole(String(token.role));
  }

  if (pathname.startsWith("/student") && token.role !== "student") {
    return redirectByRole(String(token.role));
  }

  if (pathname.startsWith("/docent") && token.role !== "docent") {
    return redirectByRole(String(token.role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/student/:path*",
    "/docent/:path*",
    "/dashboard/:path*",
  ],
};
