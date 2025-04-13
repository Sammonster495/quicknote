import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "QuickNote",
  description: "Lightweight note-taking app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: 'website',
    title: 'QuickNote',
    description: 'Lightweight note-taking app',
    siteName: 'QuickNote',
    images: [{ url: 'logo.png', width: 800, height: 527, alt: 'QuickNote', type: 'image/png', secureUrl: 'logo.png' }]
  }
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode,
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="dark text-white antialiased">
        <SessionProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
