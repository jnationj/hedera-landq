'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MenuIcon, X } from "lucide-react";

export default function LandingHeader() {

  const [menuOpen, setMenuOpen] = useState(false)
  const navbars = [
    {
      name: 'About Us',
      url: "/#about"
    },
    {
      name: 'FAQ',
      url: "/faq"
    },
    {
      name: 'Blog',
      url: "https://blog.example.com"
    },
    {
      name: 'Docs',
      url: "https://docs.example.com"
    },
    {
      name: 'Apply As Agency',
      url: "/agency/apply"
    },
    {
      name: 'Apply Dashboard',
      url: "/agency/dashboard"
    }
  ]

  const Icon = menuOpen ? X : MenuIcon
  return (
    <header className="relative z-20 w-full !fixed top-0">
      <div className="w-full flex relative items-center  justify-between px-4 py-3 border-b bg-white shadow-sm sticky top-0 ">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src="/logo.png"
              alt="LandQ Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </Link>


        {/* //for desktop */}
        {/* Navigation links */}
        <nav className="lg:flex items-center hidden gap-6 text-sm font-medium text-gray-700">
          {
            navbars.map((nav, i) => (
              <Link key={i} href={nav.url} className="!hover:underline !hover:bg-gray-500">
                {nav.name}
              </Link>
            ))
          }
        </nav>
        {/* Launch App button */}
        <Link
          href="/mint"
          className="lg:inline-block hidden px-6 py-3 text-sm font-semibold rounded-lg bg-blue-600 !text-white hover:bg-blue-700 transition-colors duration-200"
        >
          Launch App
        </Link>


        {/* for mobile  */}

        <div className="lg:hidden cursor-pointer">
          <Icon
            onClick={() => setMenuOpen(prev => !prev)}
            className="!text-2xl" />
        </div>
      </div>
     {menuOpen && <div className="py-5 bg-white h-[50dvh] rounded-md shadow-md w-full !fixed !top-16 !z-30">
        <nav className="flex items-center gap-5 text-base flex-col font-medium !text-gray-700">
          {
            navbars.map((nav, i) => (
              <Link key={i} href={nav.url} className="!hover:underline !hover:bg-grey-500">
                {nav.name}
              </Link>
            ))
          }
        </nav>
        <div className="w-1/2 mt-3 mx-auto flex items-center justify-center">
          <Link
            href="/mint"
            className="inline-block px-6 py-3 text-sm font-semibold rounded-lg bg-blue-600 !text-white hover:bg-blue-700 transition-colors duration-200">
            Launch App
          </Link>
        </div>

      </div>}
    </header>
  );
}

