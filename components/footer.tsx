import Link from "next/link"
import { config } from "@/lib/config" 

export function Footer() {
  const currentYear = new Date().getFullYear() 
  return (
    <footer style={{ backgroundColor: "#111111" }}>
      <div className="container border-t border-gray-800 mx-auto px-4 py-4 text-center text-xs sm:text-sm">
        <nav className="flex justify-center space-x-4">
          <Link href="/privacy-policy" className="text-gray-400 hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-gray-400 hover:text-gray-300 transition-colors">
            Terms of Service
          </Link>
        </nav>
      </div>
      <div className="container mx-auto px-4 py-4 border-t border-gray-800">
        <div className="text-center text-gray-400 text-xs sm:text-sm">
          <p>
            © {currentYear}{" "}
            <Link href="/" className="hover:text-gray-300 transition-colors">
              {config.platform.name}
            </Link>
            . Your simple video sharing platform.
          </p>
        </div>
      </div>
    </footer>
  )
}
