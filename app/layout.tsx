import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflow Agent Simulator",
  description: "Deterministic workflow engine for customer message processing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

