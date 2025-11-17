import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/session";

const FASTAPI = process.env.FASTAPI_BASE_URL!;

export async function GET() {
  const token = await getAccessToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${FASTAPI}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
