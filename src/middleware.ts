import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import { rateLimit } from "./lib/rate-limit"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Maintain NODE_ENV=development bypass exactly as requested
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  // Rate limiting for API routes
  if (nextUrl.pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown"

    const method = req.method
    const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(method)
    const { allowed, remaining, resetAt } = rateLimit(ip, method, isWrite ? 30 : 100)

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Remaining", String(remaining))
    return response
  }

  const isDashboard = nextUrl.pathname.startsWith("/dashboard")
  const isLoginPage = nextUrl.pathname === "/login"

  // Redirect unauthenticated users from /dashboard or any subroute to /login
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Redirect logged in users from /login to /dashboard
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/api/:path*"],
}
