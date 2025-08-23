import axios from 'axios'
const API_BASE = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
const CHUNK_SIZE = parseInt(process.env.NEXT_PUBLIC_CHUNK_SIZE || '1') * 1024 * 1024

const captureVideoFrame = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    video.onloadedmetadata = () => {
      const middleTime = video.duration * 0.5
      const randomOffset = (Math.random() - 0.5) * 0.2 
      const seekTime = Math.max(0, Math.min(video.duration, middleTime + (middleTime * randomOffset)))
      
      video.currentTime = seekTime
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to capture video frame'))
        }
      }, 'image/jpeg', 0.8)
    }

    video.onerror = () => {
      reject(new Error('Error loading video'))
    }

    video.src = URL.createObjectURL(file)
  })
}

export class ApiService {
  static async uploadVideo(file: File, onProgress?: (progress: number) => void) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    
    let videoFrame: Blob | null = null
    try {
      videoFrame = await captureVideoFrame(file)
    } catch (error) {
      console.warn('Failed to capture video frame:', error)
    }
    
    for (let index = 0; index < totalChunks; index++) {
      const start = index * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)
      
      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('index', index.toString())
      formData.append('total', totalChunks.toString())
      formData.append('filename', file.name)
      formData.append('title', file.name.replace(/\.[^/.]+$/, ""))
      
      if (videoFrame && index === 0) {
        formData.append('image', videoFrame, 'thumbnail.jpg')
      }

      const response = await axios.post(`${API_BASE}/videos`, formData)
      if (onProgress) {
        onProgress(Math.round(((index + 1) / totalChunks) * 100))
      }

      if (index + 1 === totalChunks) {
        return response.data
      }
    }
  }

  static downloadVideo(downloadUrl?: string, filename?: string) {
    console.log('ApiService.downloadVideo called with:', { downloadUrl, filename })
    if (downloadUrl) {
      console.log('Opening download_url in new tab:', downloadUrl)
      window.open(downloadUrl, '_blank')
    } else if (filename) {
      console.log('Using filename fallback:', filename)
      const fallbackUrl = `${API_BASE}/download/${filename}`
      const link = document.createElement('a')
      link.href = fallbackUrl
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      console.log('No download URL or filename provided')
    }
  }

  static async getVideos(page: number = 1, perPage: number = 10) {
    const response = await axios.get(`${API_BASE}/videos`, {
      params: { page, per_page: perPage }
    })
    return response.data
  }

  static async getVideoById(id: string) {
    const response = await axios.get(`${API_BASE}/videos/${id}`)
    return response.data
  }

  static getStreamUrl(filename: string) {
    return `${API_BASE}/stream/${filename}`
  }
}

export default ApiService
