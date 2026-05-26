import { NextResponse, type NextRequest } from "next/server";
import { UNLOCK_COOKIE, verifyUnlockCookie } from "@/lib/site-auth";

export async function proxy(request: NextRequest) {
  const secret = process.env.SITE_SECRET;
  // If no site secret is configured, do not gate.
  if (!secret) return NextResponse.next();

  const cookie = request.cookies.get(UNLOCK_COOKIE)?.value;
  const authed = await verifyUnlockCookie(cookie, secret);
  if (authed) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except: /unlock itself, /studio (Sanity Studio has its own auth),
  // /api routes, the dynamic /icon route, and Next internals/static.
  matcher: [
    "/((?!unlock|studio|api|icon|_next/static|_next/image).*)",
  ],
};
