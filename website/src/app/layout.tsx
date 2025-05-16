import type { Metadata } from "next";
import "./globals.css"; // This imports Inter and other global styles
import Providers from "./providers"; // Import the new Providers component

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
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
