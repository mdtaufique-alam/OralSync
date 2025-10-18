import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import UserSync from "@/components/UserSync";
import TanStackProvider from "@/components/providers/TanStackProvider";
import ClerkProviderWrapper from "@/components/providers/ClerkProviderWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentWise - AI Powered Dental Assistant",
  description:
    "Get instant dental advice through voice calls with our AI assistant. Avaiable 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`} suppressHydrationWarning>
        <TanStackProvider>
          <ClerkProviderWrapper>
            {/* this is done in the home page component */}
            {/* <UserSync /> */}
            <Toaster />
            {children}
          </ClerkProviderWrapper>
        </TanStackProvider>
      </body>
    </html>
  );
}
