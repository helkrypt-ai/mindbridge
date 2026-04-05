import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth/callback"];
const CHANGE_PASSWORD_PATH = "/admin/change-password";

// Paths that bypass i18n handling (non-user-facing routes)
const SKIP_I18N_PREFIXES = ["/api/", "/auth/", "/admin/", "/offline/"];

function detectLocale(pathname: string): string {
  if (pathname.startsWith("/en")) return "en";
  return "nb";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const skipI18n = SKIP_I18N_PREFIXES.some((p) => pathname.startsWith(p));

  let baseResponse: NextResponse;

  if (skipI18n) {
    baseResponse = NextResponse.next();
  } else {
    // Run i18n middleware (locale detection + prefix redirect)
    baseResponse = intlMiddleware(request) as NextResponse;

    // If intl wants to redirect, honour it directly
    if (baseResponse.status === 307 || baseResponse.status === 308) {
      return baseResponse;
    }
  }

  // Expose detected locale to Server Components via header
  const locale = detectLocale(pathname);
  baseResponse.headers.set("x-locale", locale);

  return handleAuth(request, baseResponse);
}

async function handleAuth(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Strip locale prefix for path matching (e.g. /en/dashboard → /dashboard)
  const pathname = request.nextUrl.pathname;
  const strippedPath = pathname.replace(/^\/(nb|en)/, "") || "/";

  const isPublic = PUBLIC_PATHS.some(
    (p) => strippedPath === p || strippedPath.startsWith("/auth/")
  );

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && strippedPath !== CHANGE_PASSWORD_PATH) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, must_change_password")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
    }

    if (strippedPath === "/login" || strippedPath === "/signup") {
      const dest = profile?.is_admin ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (profile?.is_admin && !strippedPath.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
