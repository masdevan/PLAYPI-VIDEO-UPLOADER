"use client"

import { useState, useEffect } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ApiService from "@/services/api"
import { toast } from "react-hot-toast"


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
  image_url: string
}

interface PaginationInfo {
  current_page: number
  last_page: number
  per_page: number
  total: number
  has_more_pages: boolean
  next_page_url: string | null
  prev_page_url: string | null
}
const VIDEOS_PER_LOAD = 10

const FeaturedVideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await ApiService.getVideos(1, VIDEOS_PER_LOAD)
        const videosData = response.videos || response.data || response || []
        setVideos(videosData)
        setPagination(response.pagination || null)
        setCurrentPage(1)
      } catch (error) {
        console.error('Error fetching videos:', error)
        toast.error('Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleLoadMore = async () => {
    if (!pagination?.has_more_pages || loadingMore) return

    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      const response = await ApiService.getVideos(nextPage, VIDEOS_PER_LOAD)
      const newVideos = response.videos || response.data || response || []
      
      setVideos(prevVideos => [...prevVideos, ...newVideos])
      setPagination(response.pagination || null)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Error loading more videos:', error)
      toast.error('Failed to load more videos')
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMoreVideos = pagination?.has_more_pages || false

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#111111" }}>
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Latest Videos</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No videos found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {videos.map((video: Video) => (
              <Link href={`/video/${video.id}`} key={video.id} className="block">
                <Card
                  className="border-0 overflow-hidden hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#0A0A0A", borderRadius: "0" }}
                >
                <div 
                  className="relative w-full group" 
                  style={{ aspectRatio: "9/16" }}
                >
                  {video.image_url ? (
                    <Image
                      src={video.image_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <Play className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left relative z-10 pointer-events-none">
                      <h2 className="text-xs sm:text-sm font-semibold text-white mb-1 line-clamp-2">{video.title}</h2>
                    </div>
                  </div>
                </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {hasMoreVideos && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="border-[#1c1c1c] text-gray-300 hover:bg-gray-800 text-sm sm:text-base bg-transparent cursor-pointer disabled:opacity-50"
              style={{ borderRadius: "0", backgroundColor: "#111111" }}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default FeaturedVideosPage
