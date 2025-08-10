"use client"

import { useState } from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"


const allVideos = [
  {
    id: "1",
    thumbnail: "/vertical-video-thumbnail-1.png",
    title: "Morning Dew",
    description: "A serene view of nature waking up with gentle light.",
  },
  {
    id: "2",
    thumbnail: "/vertical-video-thumbnail-2.png",
    title: "Urban Explorer",
    description: "Discovering hidden gems and vibrant street art in the city.",
  },
  {
    id: "3",
    thumbnail: "/vertical-video-thumbnail-3.png",
    title: "Forest Whispers",
    description: "The calming sounds of wind through ancient trees.",
  },
  {
    id: "4",
    thumbnail: "/vertical-video-thumbnail-4.png",
    title: "Desert Sunset",
    description: "Breathtaking colors as the sun dips below the horizon.",
  },
  {
    id: "5",
    thumbnail: "/vertical-video-thumbnail-5.png",
    title: "Ocean Depths",
    description: "Exploring the mysterious and beautiful underwater world.",
  },
  {
    id: "6",
    thumbnail: "/vertical-video-thumbnail-6.png",
    title: "Mountain Ascent",
    description: "Conquering peaks and enjoying panoramic views.",
  },
  {
    id: "7",
    thumbnail: "/vertical-video-thumbnail-7.png",
    title: "Cozy Cafe Vibes",
    description: "Relaxing atmosphere with a warm cup of coffee.",
  },
  {
    id: "8",
    thumbnail: "/vertical-video-thumbnail-8.png",
    title: "Starry Night Sky",
    description: "Gazing at the vastness of the universe.",
  },
  {
    id: "9",
    thumbnail: "/vertical-video-thumbnail-9.png",
    title: "Rainy Day Comfort",
    description: "The soothing sound of rain against the window.",
  },

  {
    id: "10",
    thumbnail: "/vertical-video-thumbnail-10.png",
    title: "City Lights",
    description: "The vibrant glow of a bustling metropolis at night.",
  },
  {
    id: "11",
    thumbnail: "/vertical-video-thumbnail-11.png",
    title: "Autumn Leaves",
    description: "A colorful display of fall foliage in the countryside.",
  },
  {
    id: "12",
    thumbnail: "/vertical-video-thumbnail-12.png",
    title: "Winter Wonderland",
    description: "Snow-covered landscapes and frosty mornings.",
  },
  {
    id: "13",
    thumbnail: "/vertical-video-thumbnail-13.png",
    title: "Spring Blooms",
    description: "Flowers bursting into color after a long winter.",
  },
  {
    id: "14",
    thumbnail: "/vertical-video-thumbnail-14.png",
    title: "Summer Beach Day",
    description: "Sun, sand, and refreshing ocean waves.",
  },
  {
    id: "15",
    thumbnail: "/vertical-video-thumbnail-15.png",
    title: "Underwater Adventure",
    description: "Diving deep to explore marine life and coral reefs.",
  },
]
const VIDEOS_PER_LOAD = 10

const FeaturedVideosPage = () => {
  const [displayedVideosCount, setDisplayedVideosCount] = useState(VIDEOS_PER_LOAD)
  const handleLoadMore = () => {
    setDisplayedVideosCount((prevCount) => prevCount + VIDEOS_PER_LOAD)
  }
  const videosToDisplay = allVideos.slice(0, displayedVideosCount)
  const hasMoreVideos = displayedVideosCount < allVideos.length

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#111111" }}>
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8 flex-grow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Featured Videos</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {videosToDisplay.map((video) => (
            <Link href={`/video/${video.id}`} key={video.id} className="block">
              <Card
                className="border-0 overflow-hidden hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#111111", borderRadius: "0" }}
              >
                <div className="relative w-full group" style={{ paddingBottom: "177.77%" }}>
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={`Video thumbnail ${video.id}`}
                    layout="fill"
                    objectFit="cover"
                    className="absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-left relative z-10">
                      <h2 className="text-xs sm:text-sm font-semibold text-white mb-1 line-clamp-2">{video.title}</h2>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {hasMoreVideos && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm sm:text-base bg-transparent cursor-pointer"
              style={{ borderRadius: "0", backgroundColor: "#111111" }}
            >
              Load More
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default FeaturedVideosPage
