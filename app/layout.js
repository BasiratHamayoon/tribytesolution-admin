import "./globals.css"
import { AppProvider } from "./AppContext"

export const metadata = {
  title: "TribyteSolution",
  description: "TribyteSolution admin panel",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}