import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register", "/landing", "/"];
  const privateRoutePrefixes = ["/projects"];

  const isPublicPage = publicRoutes.includes(pathname);
  const isPrivatePage = privateRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  let isTokenValid = false;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error(
          "PROXY ERROR: JWT_SECRET environment variable is not defined!",
        );
      } else {
        jwt.verify(token, secret);
        isTokenValid = true;
      }
    } catch (error) {
      console.warn(
        "Proxy session verification failed:",
        (error as Error).message,
      );
      isTokenValid = false;
    }
  }

  if (isPublicPage && isTokenValid) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  if (isPrivatePage && !isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
