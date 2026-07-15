import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamFlow",
  description: "Project management for focused software teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
