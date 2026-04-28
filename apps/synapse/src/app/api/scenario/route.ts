import { NextResponse } from "next/server";

const DEFAULT_CORE_API_URL = "http://localhost:3001";

export async function POST(req: Request) {
  const coreApiUrl = process.env.CORTEX_CORE_API_URL || DEFAULT_CORE_API_URL;
  const body = await req.json();
  const { sessionId, stage, loreId, missionId, sessionHistory } = body;

  const upstream = await fetch(`${coreApiUrl}/synapse/scenario`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      stage,
      loreId,
      missionId,
      sessionHistory,
    }),
    cache: "no-store", // Ensure we never cache scenario requests
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    );
  }

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json(
      { error: "Upstream returned invalid JSON" },
      { status: 502 },
    );
  }
}
