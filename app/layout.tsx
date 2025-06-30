import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionWrapper from "@/components/session-wrapper"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prabisha Invoice - Multi-Organization Invoice Management",
  description: "Professional invoice and quotation management system for multiple organizations",
  icons: {
    icon: "https://prabisha.com/wp-content/uploads/2023/10/Favicon-2.png",
    shortcut: "https://prabisha.com/wp-content/uploads/2023/10/Favicon-2.png",
    apple: "https://prabisha.com/wp-content/uploads/2023/10/Favicon-2.png",
  },
  manifest: "/site.webmanifest",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionWrapper session={session}>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}
