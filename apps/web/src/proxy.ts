import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register", "/landing"];
  const privateRoutePrefixes = ["/projects"];

  const isPublicPage = publicRoutes.includes(pathname);
  const isPrivatePage = privateRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  let isTokenValid = false;
  let hasToken = false;

  if (token) {
    hasToken = true;
    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (secret) {
        jwt.verify(token, secret);
        isTokenValid = true;
      }
    } catch (err: any) {
      // Expired (but present) — let it through; client-side refresh will handle it.
      // Only a missing token or an invalid signature counts as "not logged in".
      isTokenValid = err?.name === "TokenExpiredError";
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isTokenValid ? "/projects" : "/landing", request.url),
    );
  }

  if (isPublicPage && isTokenValid) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  if (isPrivatePage && !isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();

  // Ensure a CSRF token cookie exists before the app renders
  if (!request.cookies.has("csrf_token")) {
    try {
      const csrfRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/testlogin/csrf-token`,
        { headers: { cookie: request.headers.get("cookie") ?? "" } },
      );
      const setCookie = csrfRes.headers.get("set-cookie");
      if (setCookie) {
        response.headers.append("set-cookie", setCookie);
      }
    } catch {
      // CSRF pre-fetch failed — the app will request a token on first mutation
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
