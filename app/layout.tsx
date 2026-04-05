import type { Metadata } from "next";
import "./globals.css";
import FeedbackButton from "@/components/FeedbackButton";
import InstallButton from "@/components/InstallButton";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "MindBridge — Mental Wellness AI",
  description:
    "Your AI mental wellness companion. Evidence-based support, personalized daily guidance, and always-on emotional presence.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MindBridge",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#6366F1",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? "nb";

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MindBridge" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Viewport for mobile PWA */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
        <FeedbackButton />
        <InstallButton />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
