import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/session";

const FASTAPI = process.env.FASTAPI_BASE_URL!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${FASTAPI}/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return NextResponse.json(await res.json(), { status: res.status });
}

