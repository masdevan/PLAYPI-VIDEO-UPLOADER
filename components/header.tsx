import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { config } from "@/lib/config" 

export function Header() {
  return (
    <header className="border-b border-gray-800" style={{ backgroundColor: "#111111" }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-white hover:text-gray-300 transition-colors">
            <Image 
              src="/icon/icon.png" 
              alt="PlayPi Logo" 
              width={32} 
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            {config.platform.name}
          </Link>
          <Button
            asChild 
            variant="ghost"
            className="text-white hover:bg-white/20 text-xs sm:text-sm"
            style={{ borderRadius: "0" }}
          >
            <Link href="/latest-videos">Latest Videos</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
