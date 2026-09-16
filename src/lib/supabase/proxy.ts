import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth/roles";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

const ADMIN_HOME_PATH = "/admin";
const ADMIN_LOGIN_PATH = "/admin/login";

// Kept in step with AUTH_COOKIE_OPTIONS in ./server (not imported: that module is server-only).
const AUTH_COOKIE_OPTIONS = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/** Refreshes the Supabase auth session cookie and keeps non-admins out of /admin. */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const isProtectedAdminRoute =
    (pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`)) && !isLoginPage;

  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return isProtectedAdminRoute ? redirectToLogin(request, response) : response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Don't run code between client creation and getClaims(): it validates the JWT and triggers the refresh.
  const { data } = await supabase.auth.getClaims();
  const signedInAsAdmin = isAdmin(data?.claims);

  if (isProtectedAdminRoute && !signedInAsAdmin) {
    return redirectToLogin(request, response);
  }

  if (isLoginPage && signedInAsAdmin) {
    return redirectWithCookies(new URL(ADMIN_HOME_PATH, request.url), response);
  }

  return response;
}

function redirectToLogin(request: NextRequest, from: NextResponse) {
  const url = new URL(ADMIN_LOGIN_PATH, request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return redirectWithCookies(url, from);
}

function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
