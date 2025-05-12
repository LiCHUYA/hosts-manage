import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hosts 管理系统",
  description: "一个现代化的 Hosts 管理后台",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
