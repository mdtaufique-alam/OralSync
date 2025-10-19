import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Conditional middleware based on Clerk configuration
export default function(request: any) {
  // If Clerk is not configured, just pass through
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }
  
  // Use Clerk middleware if configured
  return clerkMiddleware()(request, NextResponse);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
