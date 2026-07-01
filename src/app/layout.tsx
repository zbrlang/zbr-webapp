import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { RateLimitProvider } from "./components/RateLimitProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZBR Dashboard",
  description: "Dashboard for managing ZBR Discord bots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" id="root-html" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://zbrlang.vercel.app/images/zbr.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <SessionProvider>
          <RateLimitProvider>
            {children}
          </RateLimitProvider>
          <Toaster position="bottom-right" richColors theme="dark" />
        </SessionProvider>
      </body>
    </html>
  );
}