import type { Metadata } from "next";
import { Prompt } from "next/font/google"; // 1. เลือกฟอนต์ Prompt หรือ Kanit
import "./globals.css";

// 2. ตั้งค่าฟอนต์
const prompt = Prompt({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "600", "700"], // เลือกความหนาที่ใช้
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "BandMate | หาเพื่อนร่วมวงดนตรี",
  description: "Community ของนักดนตรีและห้องซ้อม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* 3. ใส่ className ของฟอนต์ที่ body */}
      <body className={prompt.className}>{children}</body>
    </html>
  );
}