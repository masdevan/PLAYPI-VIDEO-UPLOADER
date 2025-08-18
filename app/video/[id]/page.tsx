"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image" 
import { ChevronUp, ChevronDown, Share2, Home, Loader2, ChevronLeft } from "lucide-react"
import { toast } from "react-hot-toast"
import ApiService from "@/services/api"
import VideoPlayer from "@/components/player" 

interface Video {
  id: number
  title: string
  description?: string
  filename: string
  path: string
  mime_type: string
  size: number
  status: number
  created_at: string
  updated_at: string
  preview_url: string
  thumbnail_url: string
  stream_url?: string
  download_url?: string
}

interface VideoPageProps {
  params: Promise<{
    id: string
  }>
}

const DEBOUNCE_TIME = 200 

const VideoPage: React.FC<VideoPageProps> = ({ params }) => {
  const router = useRouter()
  const unwrappedParams = use(params) as { id: string }
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await ApiService.getVideos(1, 100)
        const videosData = response.videos || response.data || response || []
        setVideos(videosData)
        
        const videoIndex = videosData.findIndex((v: Video) => v.id.toString() === unwrappedParams.id)
        if (videoIndex !== -1) {
          setCurrentVideoIndex(videoIndex)
          setCurrentVideo(videosData[videoIndex])
          console.log('Video found:', videosData[videoIndex])
        } else {
          console.log('Video not found for ID:', unwrappedParams.id)
          console.log('Available videos:', videosData.map((v: Video) => ({ id: v.id, title: v.title })))
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
        toast.error('Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [unwrappedParams.id])

  useEffect(() => {
    if (videos.length > 0) {
      const newIndex = videos.findIndex((v) => v.id.toString() === unwrappedParams.id)
      if (newIndex !== -1 && newIndex !== currentVideoIndex) {
        setCurrentVideoIndex(newIndex)
        setCurrentVideo(videos[newIndex])
      }
    }
  }, [unwrappedParams.id, currentVideoIndex, videos])

  
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const navigateVideo = useCallback(
    (direction: "up" | "down") => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
      }

      navigateTimeoutRef.current = setTimeout(() => {
        let newIndex = currentVideoIndex
        if (direction === "down") {
          newIndex = Math.min(currentVideoIndex + 1, videos.length - 1)
        } else {
          newIndex = Math.max(currentVideoIndex - 1, 0)
        }

        if (newIndex !== currentVideoIndex && videos[newIndex]) {
          router.push(`/video/${videos[newIndex].id}`)
        }
      }, DEBOUNCE_TIME)
    },
    [currentVideoIndex, router, videos],
  )

  
  const handleScroll = useCallback(
    (event: WheelEvent) => {
      event.preventDefault() 
      const direction = event.deltaY > 0 ? "down" : "up"
      navigateVideo(direction)
    },
    [navigateVideo],
  )

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchStart(touch.clientY)
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!touchStart) return
    
    const touch = event.touches[0]
    const currentY = touch.clientY
    const diff = touchStart - currentY
    
    if (Math.abs(diff) > 50) { 
      const direction = diff > 0 ? "down" : "up"
      navigateVideo(direction)
      setTouchStart(null)
    }
  }, [touchStart, navigateVideo])

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null)
  }, [])

  
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

  const isFirstVideo = currentVideoIndex === 0
  const isLastVideo = currentVideoIndex === videos.length - 1

  if (loading) {
    return (
      <div
        className="flex flex-col min-h-screen items-center justify-center text-white"
        style={{ backgroundColor: "#111111" }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-400">Loading video...</p>
      </div>
    )
  }

  if (!currentVideo) {
    return (
      <div
        className="flex flex-col min-h-screen items-center justify-center text-white"
        style={{ backgroundColor: "#111111" }}
      >
        <p>Content not found.</p>
        <Link href="/latest-videos">
          <Button
            variant="outline"
                          className="mt-4 border-[#1c1c1c] text-gray-300 hover:bg-gray-800 bg-transparent"
            style={{ borderRadius: "0" }}
          >
            Back to Latest Videos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#111111" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        {(currentVideo.stream_url || currentVideo.preview_url) ? (
          <VideoPlayer 
            src={currentVideo.stream_url || currentVideo.preview_url}
            uploadResponse={currentVideo}
            videoId={currentVideo.id.toString()}
            onBack={() => router.push('/latest-videos')}
            showBackButton={false}
            fullWidth={true}
            fullHeight={true}
            autoPlay={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Video source not available</p>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/latest-videos')}
          className="absolute top-4 left-4 text-white hover:bg-white/20 w-10 h-10 cursor-pointer z-20"
          style={{ borderRadius: "0" }}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="absolute top-4 left-20 text-white text-base font-semibold z-20 line-clamp-2 max-w-[50%]">
          {currentVideo.title}
        </div>

        <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs z-20 bg-black/50 px-3 py-1 rounded">
          Swipe up/down to navigate • Auto-play
        </div>

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
