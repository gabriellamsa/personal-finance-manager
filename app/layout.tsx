import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants/app";

import "./globals.css";

export const metadata: Metadata = {
  description: APP_DESCRIPTION,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
