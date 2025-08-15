import Link from "next/link"
import { config } from "@/lib/config" 

export function Footer() {
  const currentYear = new Date().getFullYear() 
  return (
    <>
      <div className="container border-t bg-[#0A0A0A] border-[#1c1c1c] mx-auto px-4 py-2 text-center text-xs sm:text-xs">
          <nav className="flex justify-center space-x-4">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
          </nav>
        </div>
      <footer 
      style={{ 
        backgroundImage: "url('/icon/pattern.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        backgroundColor: "#111111",
      }}
      className="relative">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-80 z-10"></div>
        <div className="container mx-auto px-4 py-6 border-t border-[#1c1c1c] z-20 relative">
          <div className="text-center text-gray-300 text-xs sm:text-sm">
            <p>
              © {currentYear}{" "}
              <Link href="/" className="hover:text-purple-700 text-purple-500 transition-colors">
                {config.platform.name}
              </Link>
              . Your simple video sharing platform.
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
