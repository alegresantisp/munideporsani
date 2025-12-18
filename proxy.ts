import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "./lib/firebase/adminApp";
import { isAdminDeportes } from "./lib/security/roles";

// Protect /admin paths by verifying the Firebase session cookie and admin claim.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );

    if (!isAdminDeportes(decoded)) {
      const url = new URL("/", request.url);
      url.searchParams.set("auth", "forbidden");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = new URL("/", request.url);
    url.searchParams.set("auth", "expired");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};