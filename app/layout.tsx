import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forbes 2026 Under-30 Billionaires",
  description: "Interactive dashboard: 35 billionaires under age 30, $91.4B combined net worth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
