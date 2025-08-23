"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { Upload, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { validateVideoFile } from "@/lib/config"
import Link from "next/link"
import { config } from "@/lib/config"
import ApiService from "@/services/api"
import VideoPlayer from "@/components/player"

const Page: React.FC = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [uploadResponse, setUploadResponse] = useState<any>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isTosAccepted, setIsTosAccepted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [currentResolution, setCurrentResolution] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      toast.error(validation.error || "Please upload a valid video file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setCurrentPhase('Initializing Video...')
    setCurrentResolution('')
    
    try {
      const response = await ApiService.uploadVideo(file, (progress, resolution, phase) => {
        setUploadProgress(progress)
        if (resolution) setCurrentResolution(resolution)
        if (phase) setCurrentPhase(phase)
      })
      
      const objectUrl = URL.createObjectURL(file)
      setUploadedVideo(objectUrl)
      setUploadResponse(response)
      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      console.error("Error during video upload:", error)
      toast.error(error instanceof Error ? error.message : "There was an error uploading your video. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setCurrentPhase('')
      setCurrentResolution('')
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



  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#0E0E0E" }} suppressHydrationWarning>
      <Header />
      <main className={`container mx-auto px-4 py-8 sm:py-16 flex-grow block ${uploadedVideo ? 'mb-10' : ''}`}>
        {!uploadedVideo ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`p-6 sm:p-12 text-center border-2 border-dashed transition-all duration-200 ${
                isDragging ? "border-purple-400 bg-purple-400/10" : "border-[#1c1c1c] hover:border-[#1c1c1c]"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ backgroundColor: "#0A0A0A" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <div className="text-center relative">
                  <Loader2 className="w-14 h-14 mx-auto mb-4 text-gray-400 animate-spin" />
                  
                  <div className="text-sm font-bold text-purple-400 absolute top-0 translate-x-1/2 left-1/2" style={{ 
                    marginLeft: uploadProgress < 10 ? "-22px" : uploadProgress === 100 ? "-35px" : "-32px", 
                    marginTop: "18px" 
                  }}>
                    {uploadProgress}%
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="text-sm text-gray-300">
                      {currentPhase}
                    </div>
                    
                    {currentResolution && (
                      <div className="text-xs text-purple-400 font-medium">
                        Current: {currentResolution}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                    Upload Your Video
                  </h2>
                  <p className="text-sm sm:text-base text-gray-400 mb-6">Drag & drop your video file or click to select</p>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-base cursor-pointer"
                    style={{ borderRadius: "0" }}
                    disabled={!isTosAccepted}
                  >
                    Select Video File
                  </Button>
                </>
              )}
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
              <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                <Checkbox
                  id="tos"
                  checked={isTosAccepted}
                  onCheckedChange={(checked) => setIsTosAccepted(!!checked)}
                  className="border-[#393939] cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
            <div className="mt-8 p-6 sm:p-8 text-center border border-[#1c1c1c]" style={{ backgroundColor: "#0A0A0A" }}>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-300">Important Information</h3>
              <p className="text-sm sm:text-base text-gray-400">
                When you upload a video, it means that you agree to the rules and services provided by {config.platform.name}, and you cannot sue or do anything stated in the {config.platform.name} rules, this platform is intended for people who want to immortalize their work but in a transparent and easy way.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="relative w-full">
              <div className="hidden md:block relative w-full" style={{ aspectRatio: '16/9' }}>
                <VideoPlayer 
                  src={uploadedVideo} 
                  uploadResponse={uploadResponse}
                  onBack={() => {
                    setUploadedVideo(null)
                    setUploadResponse(null)
                  }}
                  fullWidth={true}
                  fullHeight={true}
                />
              </div>
              
              <div className="md:hidden relative w-full" style={{ aspectRatio: '1/1' }}>
                <VideoPlayer 
                  src={uploadedVideo} 
                  uploadResponse={uploadResponse}
                  onBack={() => {
                    setUploadedVideo(null)
                    setUploadResponse(null)
                  }}
                  fullWidth={true}
                  fullHeight={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Page
