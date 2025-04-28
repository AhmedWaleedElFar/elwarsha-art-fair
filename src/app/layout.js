import { Geist } from "next/font/google";
import "./globals.css";
import Layout from "./components/layout/Layout";
import Providers from "./providers";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "El Warsha Art Fair",
  description: "Digital Art Exhibition & Competition Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased bg-black text-white`} suppressHydrationWarning>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
