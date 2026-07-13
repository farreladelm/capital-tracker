/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capital Tracker",
  description: "Track your capital",
  manifest: "/manifest.json",
};

import { Toaster } from "sonner";
import { DesktopHeader } from "@/app/components/DesktopHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased light`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Capital" />
        <link rel="apple-touch-icon" href="/icon.jpg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body-md bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <DesktopHeader />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
        <Toaster
          position="top-center"
          className="rounded-xl"
        />
      </body>
    </html>
  );
}
