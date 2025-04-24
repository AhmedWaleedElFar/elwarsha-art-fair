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
    <html lang="en">
      <body className={`${geist.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
