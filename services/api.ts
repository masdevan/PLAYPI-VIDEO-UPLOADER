import axios from 'axios'
import { apiClient } from './axios'

const CHUNK_SIZE = 1024 * 1024

export class ApiService {
  static async uploadVideo(file: File, onProgress?: (progress: number) => void) {
    if (file.size <= CHUNK_SIZE) {
      try {
        const formData = new FormData()
        formData.append('video', file)
        formData.append('filename', file.name)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ""))

        if (onProgress) {
          onProgress(50) 
        }

        console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes')
        const response = await apiClient.post('/videos', formData)
        
        if (onProgress) {
          onProgress(100) 
        }

        console.log('Upload successful:', response.data)
        return response.data
      } catch (error: unknown) {
        console.error('Upload error details:', error)
        if (axios.isAxiosError(error)) {
          console.error('Response status:', error.response?.status)
          console.error('Response data:', error.response?.data)
          throw new Error(`Upload failed: ${error.response?.status} - ${error.message}`)
        }
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    
    try {
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

        console.log(`Uploading chunk ${index + 1}/${totalChunks} for file:`, file.name)
        const response = await apiClient.post('/videos', formData)

        const progress = Math.round(((index + 1) / totalChunks) * 100)
        if (onProgress) {
          onProgress(progress)
        }

        if (index + 1 === totalChunks) {
          console.log('Chunked upload completed successfully:', response.data)
          return response.data
        }
      }
    } catch (error: unknown) {
      console.error('Chunked upload error details:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)
        throw new Error(`Upload failed: ${error.response?.status} - ${error.message}`)
      }
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static downloadVideo(filename: string) {
    const apiBase = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
    const downloadUrl = `${apiBase}/download/${filename}`
    window.open(downloadUrl, '_blank')
  }

  static async getVideos(page: number = 1, perPage: number = 10) {
    try {
      const response = await apiClient.get('/videos', {
        params: {
          page,
          per_page: perPage
        }
      })
      return response.data
    } catch (error: unknown) {
      console.error('Error fetching videos:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch videos: ${error.response?.status} - ${error.message}`)
      }
      throw new Error(`Failed to fetch videos: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async getVideoById(id: string) {
    try {
      const response = await apiClient.get(`/videos/${id}`)
      return response.data
    } catch (error: unknown) {
      console.error('Error fetching video:', error)
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to fetch video: ${error.response?.status} - ${error.message}`)
      }
      throw new Error(`Failed to fetch video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static getThumbnailUrl(filename: string) {
    const apiBase = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
    return `${apiBase}/thumbnail/${filename}`
  }

  static getStreamUrl(filename: string) {
    const apiBase = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
    return `${apiBase}/stream/${filename}`
  }
}

export default ApiService
