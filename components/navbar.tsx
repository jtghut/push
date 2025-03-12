"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, Menu, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-[#0f0f0f] border-b border-gray-800 sticky top-0 z-50 h-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Code2 className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">LuauEditor</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive("/") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                Home
              </Link>
              <Link
                href="/download"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  isActive("/download") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                Download
              </Link>
            </div>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-2">
            {!isActive("/login") && (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white border-green-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Open main menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#0f0f0f] border-b border-gray-800">
          <Link
            href="/"
            className={cn(
              "block px-3 py-2 rounded-md text-base font-medium",
              isActive("/") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/download"
            className={cn(
              "block px-3 py-2 rounded-md text-base font-medium",
              isActive("/login") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            Download
          </Link>
          <div className="flex space-x-2 pt-2">
            <Link href="/login" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white border-green-700"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

