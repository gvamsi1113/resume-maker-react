import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This imports Inter and other global styles
import { ResumeDataProvider } from "@/context/ResumeDataContext"; // Added import
import Providers from "./providers"; // Added import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rezoome - AI Resume Tailoring for each JD",
  description: "Tailor your résumé for any job description in seconds with Rezoome.",
  icons: {
    icon: '/Rezoome_2.svg', // Or '/favicon.ico' or other paths/types
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* Wrapped children with Providers */}
          <ResumeDataProvider> {/* Wrapped children with provider */}
            {children}
          </ResumeDataProvider>
        </Providers>
      </body>
    </html>
  );
}
