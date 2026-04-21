import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware
 * 
 * This middleware runs on every request and:
 * 1. Refreshes the user's auth session
 * 2. Updates auth cookies
 * 
 * You can add route protection here if needed.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (all Next.js internal routes: static, image, HMR, etc.)
     * - favicon.ico (favicon file)
     * - Public files (images, etc.)
     */
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

