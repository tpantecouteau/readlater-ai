import { setAuthCookiesResponse } from "@/lib/cookies";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_BASE_URL!;

export async function POST(req: Request) {
  const body = await req.formData();

  const res = await fetch(`${FASTAPI_URL}/auth/login`, {
    method: "POST",
    body: body, // credentials: formData
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await res.json();
  return setAuthCookiesResponse({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
}
