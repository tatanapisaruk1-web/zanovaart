import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ЗАНОВО — админ-панель",
  description: "Внутренняя админ-панель Арт-студии ЗАНОВО",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
