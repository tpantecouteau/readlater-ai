import { NextResponse } from "next/server";
import { refreshAccessTokenIfNeeded } from "@/lib/session";

export async function POST() {
  const token = await refreshAccessTokenIfNeeded();
  if (!token)
    return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
