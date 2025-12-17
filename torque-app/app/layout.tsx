import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Powertrain Architect",
  description: "ATS/ETS2 Powertrain Editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased flex flex-row h-screen w-full overflow-hidden transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <div className="titlebar" />
          <AppSidebar />
          <main className="flex-1 h-full overflow-auto bg-background p-8 transition-colors duration-300">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
