"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { Upload, Pause, Play, VolumeX, Volume2, Share2, Download, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { validateVideoFile } from "@/lib/config"
import Link from "next/link"
import { config } from "@/lib/config"

const Page: React.FC = () => {
  const [uploadedVideo, setUploadedVideo] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isTosAccepted, setIsTosAccepted] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)

  const videoRef = React.useRef<HTMLVideoElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      toast.error(validation.error || "Please upload a valid video file")
      return
    }

    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const url = URL.createObjectURL(file)
      setUploadedVideo(url)
      toast.success(`${file.name} is ready to play`)
    } catch (error) {
      console.error("Error during video upload:", error)
      toast.error("There was an error uploading your video. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      if (isTosAccepted) {
        handleFileSelect(files[0])
      } else {
        toast.error("Please accept the Terms of Service to upload videos.")
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      setProgress((current / total) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const newTime = (clickX / width) * duration
      videoRef.current.currentTime = newTime
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleShare = () => {
    if (uploadedVideo) {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Video link has been copied to clipboard")
    }
  }

  const handleDownload = () => {
    if (uploadedVideo) {
      const a = document.createElement("a")
      a.href = uploadedVideo
      a.download = "video.mp4"
      a.click()
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#111111" }} suppressHydrationWarning>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:py-16 flex-grow">
        {!uploadedVideo ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`p-6 sm:p-12 text-center border-2 border-dashed transition-all duration-200 ${
                isDragging ? "border-purple-400 bg-purple-400/10" : "border-gray-700 hover:border-gray-600"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ backgroundColor: "#111111" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              )}
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                {isUploading ? "Uploading Video..." : "Upload Your Video"}
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-6">Drag & drop your video file or click to select</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base cursor-pointer"
                style={{ borderRadius: "0" }}
                disabled={!isTosAccepted || isUploading}
              >
                {isUploading ? "Uploading..." : "Select Video File"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                disabled={isUploading}
              />
              <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                <Checkbox
                  id="tos"
                  checked={isTosAccepted}
                  onCheckedChange={(checked) => setIsTosAccepted(!!checked)}
                  className="border-gray-500 cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  disabled={isUploading}
                />
                <Label
                  htmlFor="tos"
                  className="flex flex-wrap items-center gap-1 text-xs"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms-of-service"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Terms of Service
                  </Link>
                  and
                  <Link
                    href="/privacy-policy"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <div className="mt-4 text-xs sm:text-sm text-gray-500">
                Supports: MP4, WebM, AVI, MOV
              </div>
            </div>
            <div className="mt-8 p-6 sm:p-8 text-center border border-gray-800" style={{ backgroundColor: "#111111" }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-300">Important Information</h3>
              <p className="text-sm sm:text-base text-gray-400">
                When you upload a video, it means that you agree to the rules and services provided by {config.platform.name}, and you cannot sue or do anything stated in the {config.platform.name} rules, this platform is intended for people who want to immortalize their work but in a transparent and easy way.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 overflow-hidden" style={{ backgroundColor: "#111111", borderRadius: "0" }}>
              <div className="relative">
                <video
                  ref={videoRef}
                  src={uploadedVideo}
                  className="w-full bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 sm:p-4">
                  <div className="w-full h-1 bg-gray-600 mb-2 sm:mb-3 cursor-pointer" onClick={handleProgressClick}>
                    <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto"
                        style={{ borderRadius: "0" }}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto"
                        style={{ borderRadius: "0" }}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </Button>
                      <div className="text-xs sm:text-sm text-gray-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto"
                        style={{ borderRadius: "0" }}
                      >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto"
                        style={{ borderRadius: "0" }}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <div className="mt-4 sm:mt-6 text-center">
              <Button
                onClick={() => {
                  setUploadedVideo(null)
                  setIsPlaying(false)
                  setProgress(0)
                  setCurrentTime(0)
                  setDuration(0)
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm sm:text-base"
                style={{ borderRadius: "0", backgroundColor: "#111111" }}
              >
                Upload New Video
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Page
