import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "العسّال — مساعد العسل الذكي",
  description: "منصة ذكية لمحبي العسل الطبيعي والنحالين",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
