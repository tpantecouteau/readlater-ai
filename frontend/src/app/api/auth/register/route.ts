import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_BASE_URL!;

export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(`${FASTAPI_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
            { error: data.detail || "Registration failed" },
            { status: res.status }
        );
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
