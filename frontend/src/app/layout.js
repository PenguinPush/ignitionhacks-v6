"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }) {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform duration-200"
        >
          {dark ? (
            <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="w-5 h-5 transition-transform duration-300 rotate-0" />
          )}
        </button>
        {children}
      </body>
    </html>
  );
}
