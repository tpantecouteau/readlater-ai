import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const REFRESH_COOKIE = process.env.REFRESH_TOKEN_COOKIE || "refresh_token";

export async function GET() {
  const cookieStore = await cookies();
  const isAuth = !!cookieStore.get(REFRESH_COOKIE)?.value;
  console.log(isAuth);
  return NextResponse.json({ authenticated: isAuth });
}
