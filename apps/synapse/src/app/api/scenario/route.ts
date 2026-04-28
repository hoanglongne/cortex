import { NextResponse } from "next/server";

const DEFAULT_CORE_API_URL = "http://localhost:3001";

export async function POST(req: Request) {
  try {
    const rawUrl = process.env.CORTEX_CORE_API_URL || DEFAULT_CORE_API_URL;
    
    // Add https:// if protocol is missing
    let normalizedUrl = rawUrl;
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      normalizedUrl = `https://${rawUrl}`;
    }
    
    // Remove trailing slash if exists
    const coreApiUrl = normalizedUrl.endsWith("/") ? normalizedUrl.slice(0, -1) : normalizedUrl;
    
    const body = await req.json();
    const { sessionId, stage, loreId, missionId, sessionHistory } = body;

    console.log(`[SynapseProxy] Fetching scenario from: ${coreApiUrl}/synapse/scenario`);

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
      cache: "no-store",
    });

    const text = await upstream.text();
    
    if (!upstream.ok) {
      console.error(`[SynapseProxy] Upstream error (${upstream.status}):`, text);
      return NextResponse.json(
        { error: text || `Upstream error: ${upstream.status}` },
        { status: upstream.status },
      );
    }

    try {
      return NextResponse.json(JSON.parse(text));
    } catch (parseError) {
      console.error("[SynapseProxy] Failed to parse upstream JSON:", text);
      return NextResponse.json(
        { error: "Upstream returned invalid JSON" },
        { status: 502 },
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[SynapseProxy] Critical Error:", errorMessage);
    return NextResponse.json(
      { 
        error: "Internal Server Error in Synapse Proxy", 
        details: errorMessage,
        hint: "Check if CORTEX_CORE_API_URL is reachable and correctly formatted."
      },
      { status: 500 },
    );
  }
}
