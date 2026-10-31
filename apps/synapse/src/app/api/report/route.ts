import { NextResponse } from "next/server";

const DEFAULT_CORE_API_URL = "http://localhost:3001";

/** Passes the call on to the Cortex API (a scene report). */
export async function POST(req: Request) {
  try {
    const raw = process.env.CORTEX_CORE_API_URL || DEFAULT_CORE_API_URL;
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const base = withProtocol.endsWith("/") ? withProtocol.slice(0, -1) : withProtocol;
    const upstream = await fetch(`${base}/synapse/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(await req.json()),
      cache: "no-store",
    });
    const text = await upstream.text();
    if (!upstream.ok) return NextResponse.json({ error: text || `Upstream error: ${upstream.status}` }, { status: upstream.status });
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ error: "Upstream returned invalid JSON" }, { status: 502 });
    }
  } catch (err) {
    console.error("[SynapseProxy report]", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
