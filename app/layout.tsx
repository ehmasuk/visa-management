import { SessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { FlashToaster } from "@/components/flash-toaster"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <SessionProvider>
              {/* Fresh key per server render → remounts after every action redirect
                  (even same-path), so <FlashToaster> re-reads the flash cookie. */}
              <FlashToaster key={Date.now()} />
              <Toaster />
              {children}
            </SessionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
