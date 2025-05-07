import type { Metadata } from "next";
import "./globals.css"; // This imports Inter and other global styles

export const metadata: Metadata = {
  title: "Rezoome - AI Résumé Tailoring",
  description: "Tailor your résumé for any job description in seconds with Rezoome.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* The font-family is now primarily controlled by globals.css (Inter font) */}
      {/* antialiased is a good utility class to keep */}
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
