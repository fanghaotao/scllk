import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { setupErrorFilter } from "./utils/errorUtils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "古诗词连连看",
  description: "一个有趣的古诗词学习游戏",
};

// 设置错误过滤器
if (typeof window !== "undefined") {
  setupErrorFilter();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
