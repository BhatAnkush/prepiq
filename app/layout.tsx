import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "PrepIQ — AI mock interviews built for your JD",
  description:
    "Paste a job description, upload your resume, get a tailored mock interview with scoring and model answers.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
          <Navbar />
          <SessionProvider>
            <div className="flex-1">{children}</div>
          </SessionProvider>
          <Footer />
        </div>
      </body>
    </html>
  );
}
