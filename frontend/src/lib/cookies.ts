import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";
export const ACCESS = process.env.ACCESS_TOKEN_COOKIE || "access_token";
export const REFRESH = process.env.REFRESH_TOKEN_COOKIE || "refresh_token";

// ✅ FIX: use NextResponse to set cookies properly

import { NextResponse } from "next/server";

export function setAuthCookiesResponse({
  accessToken,
  refreshToken,
  accessMaxAge = 60 * 30, // 30 minutes
  refreshMaxAge = 60 * 60 * 24 * 7, // 7 days
}: {
  accessToken: string;
  refreshToken: string;
  accessMaxAge?: number;
  refreshMaxAge?: number;
}) {
  const response = NextResponse.json({ success: true });

  response.cookies.set(ACCESS, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  response.cookies.set(REFRESH, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge,
  });

  return response;
}

export function clearAuthCookiesResponse() {
  const res = NextResponse.json({ ok: true });
  let deletedAccess = res.cookies.delete(ACCESS);
  let deleteRefresh = res.cookies.delete(REFRESH);
  return res;
}

export async function getAccessCookie() {
  const jar = await cookies();
  return jar.get(ACCESS)?.value || null;
}

export async function getRefreshCookie() {
  const jar = await cookies();
  return jar.get(REFRESH)?.value || null;
}
