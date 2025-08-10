"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image" 
import { ChevronUp, ChevronDown, Share2, Home } from "lucide-react"
import { toast } from "react-hot-toast" 

const allVideos = [
  {
    id: "1",
    url: "/placeholder-ag2t2.png",
    title: "Morning Dew",
    description: "A serene view of nature waking up with gentle light.",
  },
  {
    id: "2",
    url: "/placeholder-1nalx.png",
    title: "Urban Explorer",
    description: "Discovering hidden gems and vibrant street art in the city.",
  },
  {
    id: "3",
    url: "/forest-whispers-vertical.png",
    title: "Forest Whispers",
    description: "The calming sounds of wind through ancient trees.",
  },
  {
    id: "4",
    url: "/desert-sunset-vertical.png",
    title: "Desert Sunset",
    description: "Breathtaking colors as the sun dips below the horizon.",
  },
  {
    id: "5",
    url: "/placeholder-pyj55.png",
    title: "Ocean Depths",
    description: "Exploring the mysterious and beautiful underwater world.",
  },
  {
    id: "6",
    url: "/mountain-ascent-vertical.png",
    title: "Mountain Ascent",
    description: "Conquering peaks and enjoying panoramic views.",
  },
  {
    id: "7",
    url: "/placeholder-vqu7u.png",
    title: "Cozy Cafe Vibes",
    description: "Relaxing atmosphere with a warm cup of coffee.",
  },
  {
    id: "8",
    url: "/starry-night-vertical.png",
    title: "Starry Night Sky",
    description: "Gazing at the vastness of the universe.",
  },
  {
    id: "9",
    url: "/rainy-day-comfort.png",
    title: "Rainy Day Comfort",
    description: "The soothing sound of rain against the window.",
  },
  {
    id: "10",
    url: "/placeholder-94g3n.png",
    title: "City Lights",
    description: "The vibrant glow of a bustling metropolis at night.",
  },
  {
    id: "11",
    url: "/placeholder.svg?height=1920&width=1080",
    title: "Autumn Leaves",
    description: "A colorful display of fall foliage in the countryside.",
  },
  {
    id: "12",
    url: "/placeholder.svg?height=1920&width=1080",
    title: "Winter Wonderland",
    description: "Snow-covered landscapes and frosty mornings.",
  },
  {
    id: "13",
    url: "/placeholder.svg?height=1920&width=1080",
    title: "Spring Blooms",
    description: "Flowers bursting into color after a long winter.",
  },
  {
    id: "14",
    url: "/placeholder.svg?height=1920&width=1080",
    title: "Summer Beach Day",
    description: "Sun, sand, and refreshing ocean waves.",
  },
  {
    id: "15",
    url: "/placeholder.svg?height=1920&width=1080",
    title: "Underwater Adventure",
    description: "Diving deep to explore marine life and coral reefs.",
  },
]

interface VideoPageProps {
  params: Promise<{
    id: string
  }>
}

const DEBOUNCE_TIME = 200 

const VideoPage: React.FC<VideoPageProps> = ({ params }) => {
  const router = useRouter()
  const unwrappedParams = use(params) as { id: string }
  const [currentVideoIndex, setCurrentVideoIndex] = useState(() => allVideos.findIndex((v) => v.id === unwrappedParams.id))

  useEffect(() => {
    const newIndex = allVideos.findIndex((v) => v.id === unwrappedParams.id)
    if (newIndex !== -1 && newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex)
    }
  }, [unwrappedParams.id, currentVideoIndex])

  
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const navigateVideo = useCallback(
    (direction: "up" | "down") => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
      }

      navigateTimeoutRef.current = setTimeout(() => {
        let newIndex = currentVideoIndex
        if (direction === "down") {
          newIndex = Math.min(currentVideoIndex + 1, allVideos.length - 1)
        } else {
          newIndex = Math.max(currentVideoIndex - 1, 0)
        }

        if (newIndex !== currentVideoIndex) {
          router.push(`/video/${allVideos[newIndex].id}`)
        }
      }, DEBOUNCE_TIME)
    },
    [currentVideoIndex, router],
  )

  
  const handleScroll = useCallback(
    (event: WheelEvent) => {
      event.preventDefault() 
      const direction = event.deltaY > 0 ? "down" : "up"
      navigateVideo(direction)
    },
    [navigateVideo],
  )

  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault() 
        navigateVideo("down")
      } else if (event.key === "ArrowUp") {
        event.preventDefault() 
        navigateVideo("up")
      }
    },
    [navigateVideo],
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("wheel", handleScroll, { passive: false })
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("wheel", handleScroll)
        window.removeEventListener("keydown", handleKeyDown)
        if (navigateTimeoutRef.current) {
          clearTimeout(navigateTimeoutRef.current)
        }
      }
    }
  }, [handleScroll, handleKeyDown])

  const handleShare = useCallback(() => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Video link has been copied to clipboard")
    }
  }, [])

  const currentVideo = allVideos[currentVideoIndex]
  const isFirstVideo = currentVideoIndex === 0
  const isLastVideo = currentVideoIndex === allVideos.length - 1



  if (!currentVideo) {
    return (
      <div
        className="flex flex-col min-h-screen items-center justify-center text-white"
        style={{ backgroundColor: "#111111" }}
      >
        <p>Content not found.</p>
        <Link href="/featured-videos">
          <Button
            variant="outline"
            className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            style={{ borderRadius: "0" }}
          >
            Back to Featured Videos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#111111" }}
    >
      
      <div
        className="relative w-full h-full max-w-full max-h-full" 
        style={{ aspectRatio: "9 / 16", backgroundColor: "#000000" }}
      >
        <Image
          key={currentVideo.id} 
          src={currentVideo.url || "/placeholder.svg"}
          alt={currentVideo.title}
          layout="fill"
          objectFit="contain" 
          className="absolute inset-0"
        />
        
        <div className="absolute bottom-4 left-4 text-gray-400 text-sm font-semibold z-20 line-clamp-2">
          {currentVideo.title}
        </div>

        
        <Link href="/featured-videos" passHref>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-white hover:bg-white/20 w-10 h-10 cursor-pointer z-20"
            style={{ borderRadius: "0" }}
          >
            <Home className="w-6 h-6" /> 
          </Button>
        </Link>

        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="absolute top-4 right-4 text-white hover:bg-white/20 w-10 h-10 cursor-pointer z-20"
          style={{ borderRadius: "0" }}
        >
          <Share2 className="w-6 h-6" />
        </Button>
      </div>

      
      <div className="hidden md:flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateVideo("up")}
          disabled={isFirstVideo}
          className="text-white hover:bg-white/20 w-10 h-10 cursor-pointer"
          style={{ borderRadius: "0" }}
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateVideo("down")}
          disabled={isLastVideo}
          className="text-white hover:bg-white/20 w-10 h-10 cursor-pointer"
          style={{ borderRadius: "0" }}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

export default VideoPage
