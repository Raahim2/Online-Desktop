import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CrazyTools - Free Online Tools",
  description: "Free Online Tools",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.className} font-sans bg-[#0f0e1a] text-white overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}