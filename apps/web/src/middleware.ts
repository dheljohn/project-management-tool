import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register", "/landing"];
  const privateRoutePrefixes = ["/projects"];

  const isPublicPage = publicRoutes.includes(pathname);
  const isPrivatePage = privateRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  let isTokenValid = false;

  if (token) {
    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (secret) {
        const encodedSecret = new TextEncoder().encode(secret);
        await jwtVerify(token, encodedSecret);
        isTokenValid = true;
      }
    } catch (err: any) {
      isTokenValid = err?.code === "ERR_JWT_EXPIRED";
    }
  } else {
    isTokenValid = isPrivatePage ? true : false;
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

  // Seed a CSRF token cookie if the browser doesn't have one yet.
  // Generate it here in middleware rather than fetching from the API —
  // fetching from NEXT_PUBLIC_API_URL (Render) sets a cookie on the wrong
  // domain and the client-side getCsrfToken() can never read it.
  if (!request.cookies.has("csrf_token")) {
    // Web Crypto API — available in all edge runtimes, unlike Node's crypto module
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const csrfToken = Array.from(bytes, (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("csrf_token", csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
