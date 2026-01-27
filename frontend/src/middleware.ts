import { isAuthenticatedFromReq } from "@/lib/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/", "/post/:path*"],
};

export default async function middleware(req: NextRequest) {
  const isAuth = isAuthenticatedFromReq(req);
  const { pathname } = req.nextUrl;

  if (!isAuth && (pathname === "/" || pathname.startsWith("/post"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
