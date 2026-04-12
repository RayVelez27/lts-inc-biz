import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request.
 * Without this, Server Components will see stale or missing sessions.
 *
 * IMPORTANT: Do NOT insert logic between `createServerClient` and
 * `supabase.auth.getUser()` — it must run to refresh the token.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh the session token. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optional: gate /admin/* behind authentication here once roles exist.
  // if (request.nextUrl.pathname.startsWith("/admin") && !user) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/account";
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
