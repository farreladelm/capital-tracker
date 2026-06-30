import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth") || req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

  if (isAuthRoute) {
    if (isLoggedIn && !req.nextUrl.pathname.startsWith("/api/auth")) {
      return Response.redirect(new URL("/", req.nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  // Matches all routes except api, static files, and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
