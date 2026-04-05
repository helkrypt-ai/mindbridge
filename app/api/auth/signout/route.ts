import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const response = NextResponse.redirect(new URL('/login', request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set(name, value, options as Partial<ResponseCookie>);
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set(name, '', options as Partial<ResponseCookie>);
        },
      },
    }
  );

  await supabase.auth.signOut();
  return response;
}
