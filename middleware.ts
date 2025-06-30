import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    console.log("Middleware - Pathname:", pathname)
    console.log("Middleware - Token exists:", !!token)
    console.log("Middleware - Organization ID:", token?.organizationId)

    // If user is not authenticated, redirect to signin
    if (!token) {
      console.log("Middleware - No token, redirecting to signin")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // If user doesn't have an organization and is not on setup pages, redirect to setup
    if (!token.organizationId && !pathname.startsWith("/setup") && !pathname.startsWith("/auth")) {
      console.log("Middleware - No organization, redirecting to setup")
      return NextResponse.redirect(new URL("/setup/organization", req.url))
    }

    // If user has organization but tries to access setup pages, redirect to dashboard
    if (token.organizationId && pathname.startsWith("/setup")) {
      console.log("Middleware - Has organization, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && token.role?.name !== "ADMIN") {
      console.log("Middleware - Not admin, redirecting to dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    console.log("Middleware - Allowing request to:", pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    // Protect all routes except:
    // - API routes (except auth)
    // - Static files
    // - Auth pages
    // - Root page
    "/dashboard/:path*",
    "/invoices/:path*",
    "/quotations/:path*",
    "/customers/:path*",
    "/company/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/setup/:path*"
  ]
} 