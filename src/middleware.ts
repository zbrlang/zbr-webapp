import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Maintain NODE_ENV=development bypass exactly as requested
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
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
  matcher: ["/dashboard", "/dashboard/:path*", "/login"],
}
