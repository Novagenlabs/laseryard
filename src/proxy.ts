import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing for the Get Metal Business Cards sub-brand.
 *
 * getmetalbusinesscards.laseryard.com (and later its own domain) serves the
 * pages under /gmbc without the prefix showing in the address bar. On the main
 * domain, /gmbc redirects to the sub-brand host so the page has one canonical
 * home. Static assets and API routes pass through untouched.
 */
const GMBC_HOSTS = ["getmetalbusinesscards.laseryard.com", "getmetalbusinesscards.com", "www.getmetalbusinesscards.com"];
const GMBC_CANONICAL = "https://getmetalbusinesscards.laseryard.com";

function isGmbcHost(host: string) {
  const h = host.toLowerCase().split(":")[0];
  return GMBC_HOSTS.includes(h) || h.startsWith("getmetalbusinesscards.");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (isGmbcHost(host)) {
    // Already prefixed (e.g. a hard link to /gmbc on the sub-brand host): strip it.
    if (pathname === "/gmbc" || pathname.startsWith("/gmbc/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(/^\/gmbc/, "") || "/";
      return NextResponse.redirect(url, 308);
    }
    const url = request.nextUrl.clone();
    url.pathname = `/gmbc${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Main domain in production: send /gmbc to its own host. Local hosts keep /gmbc reachable.
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|\d+\.\d+\.\d+\.\d+)(:\d+)?$/.test(host);
  if (!isLocal && (pathname === "/gmbc" || pathname.startsWith("/gmbc/"))) {
    return NextResponse.redirect(`${GMBC_CANONICAL}${pathname.replace(/^\/gmbc/, "") || "/"}`, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
