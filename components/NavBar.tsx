"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/checkin", label: "Check-in" },
  { href: "/chat", label: "Chat" },
  { href: "/journal", label: "Journal" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b bg-white px-4 sm:px-6 py-3 flex items-center gap-6">
      <Link href="/dashboard" className="font-bold text-indigo-700 text-lg mr-4">MindBridge</Link>
      {NAV.map(({ href, label }) => (
        <Link key={href} href={href} className={`text-sm font-medium ${pathname === href ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}>{label}</Link>
      ))}
      <button onClick={handleSignOut} className="ml-auto text-sm text-gray-500 hover:text-gray-900">Sign out</button>
    </nav>
  );
}
