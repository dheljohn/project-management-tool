// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Prevents Next.js from trying to statically optimize or cache this route.
// Auth cookies MUST NOT be cached — this is critical.
export const dynamic = "force-dynamic";

async function proxy(req: NextRequest, path: string[]) {
  const targetUrl = new URL(`${process.env.API_URL}/${path.join("/")}`);

  // Forward query params (e.g. ?page=2&limit=20)
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const isBodyless = ["GET", "HEAD"].includes(req.method);

  const res = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: buildForwardHeaders(req),
    body: isBodyless ? undefined : await req.arrayBuffer(),
    // Required so this fetch isn't affected by Next's own data cache
    cache: "no-store",
  });

  return buildClientResponse(res);
}

function buildForwardHeaders(req: NextRequest): Headers {
  const headers = new Headers();

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // Forward the browser's cookies to Render
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // Forward custom auth-related headers
  const csrf = req.headers.get("x-csrf-token");
  if (csrf) headers.set("x-csrf-token", csrf);

  return headers;
}

async function buildClientResponse(res: Response) {
  const body = await res.arrayBuffer();

  const nextRes = new NextResponse(body, {
    status: res.status,
    statusText: res.statusText,
  });

  // getSetCookie() correctly returns an array of each individual
  // Set-Cookie header. res.headers.get('set-cookie') would instead
  // collapse multiple cookies into one comma-joined string, which
  // browsers CANNOT parse back into separate cookies.
  const setCookies = res.headers.getSetCookie?.() ?? [];
  setCookies.forEach((c) => nextRes.headers.append("set-cookie", c));

  const contentType = res.headers.get("content-type");
  if (contentType) nextRes.headers.set("content-type", contentType);

  return nextRes;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
