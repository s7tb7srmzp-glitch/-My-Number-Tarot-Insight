import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import { withBasePath } from "@/lib/basePath";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "수비학 타로 상담 | 나의 숫자, 나의 이야기",
  description:
    "생년월일로 성격·영혼·작년·올해·내년 카드를 자동 계산하고, 삶의 흐름을 서사로 풀어주는 자리이타 수비학 타로 상담 리포트.",
  // Next.js가 basePath를 자동으로 붙여주지 않는 필드라 직접 prefix한다.
  manifest: withBasePath("/manifest.webmanifest"),
  icons: {
    icon: [
      { url: withBasePath("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
      { url: withBasePath("/icons/icon-512.png"), sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: withBasePath("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "수비학 타로",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#B76E79",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
