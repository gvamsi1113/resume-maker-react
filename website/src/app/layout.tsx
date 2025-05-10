import type { Metadata } from "next";
import "./globals.css"; // This imports Inter and other global styles

export const metadata: Metadata = {
  title: "Rezoome - AI Resume Tailoring for each JD",
  description: "Tailor your résumé for any job description in seconds with Rezoome.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
