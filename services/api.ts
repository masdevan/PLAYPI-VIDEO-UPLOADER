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

  static downloadVideo(filename: string) {
    const downloadUrl = `${API_BASE}/download/${filename}`
    window.open(downloadUrl, '_blank')
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

  static getThumbnailUrl(filename: string) {
    return `${API_BASE}/thumbnail/${filename}`
  }

  static getStreamUrl(filename: string) {
    return `${API_BASE}/stream/${filename}`
  }
}

export default ApiService
