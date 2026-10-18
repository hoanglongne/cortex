import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js proxy (formerly middleware): refreshes the Supabase auth session
 * cookies on every request. Routes need no protection here: the app is one
 * page that shows the sign-in screen when signed out, and every server
 * action and API route checks the user itself.
 */
export async function proxy(request: NextRequest) {
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

