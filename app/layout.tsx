import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InteropMed | Connected Healthcare Technology",
  description: "Connecting healthcare data, devices, and smart hospital infrastructure through secure, scalable interoperability technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
