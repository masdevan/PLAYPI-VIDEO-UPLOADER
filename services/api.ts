import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
const CHUNK_SIZE = parseInt(process.env.NEXT_PUBLIC_CHUNK_SIZE || '1') * 1024 * 1024

export class ApiService {
  static async uploadVideo(file: File, onProgress?: (progress: number) => void) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    
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
