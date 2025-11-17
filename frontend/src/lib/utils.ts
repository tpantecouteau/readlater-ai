import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextRequest } from "next/server";
const REFRESH_COOKIE = process.env.REFRESH_TOKEN_COOKIE || "refresh_token";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAuthenticatedFromReq(req: NextRequest): boolean {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  return !!refresh;
}
