import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth/callback"];
const CHANGE_PASSWORD_PATH = "/admin/change-password";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

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

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/auth/"));

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname !== CHANGE_PASSWORD_PATH) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, must_change_password")
      .eq("id", user.id)
      .single();

    if (profile?.must_change_password) {
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
    }

    // Redirect from login/signup
    if (pathname === "/login" || pathname === "/signup") {
      const dest = profile?.is_admin ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Keep admins out of the product — redirect to admin dashboard
    if (profile?.is_admin && !pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
