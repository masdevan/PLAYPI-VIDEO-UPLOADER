import axios from 'axios'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
const CHUNK_SIZE = parseInt(process.env.NEXT_PUBLIC_CHUNK_SIZE || '1') * 1024 * 1024
const PLATFORM_NAME = process.env.NEXT_PUBLIC_PLAYPI_NAME || 'PlayPi'

export class ApiService {
  static ffmpeg: any = null

  static async initFFmpeg() {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg()
      await this.ffmpeg.load()
    }
  }

  static async uploadVideo(file: File, onProgress?: (progress: number, resolution?: string, phase?: string) => void) {
    try {
      await this.initFFmpeg()
      
      if (onProgress) onProgress(0, undefined, 'Initializing Video...')
      
      const result: any = {}
      const availableResolutions = ['360', '480', '720', '1080']
      const originalResolution = await this.getVideoResolution(file)
      const validResolutions = availableResolutions.filter(res => parseInt(res) <= originalResolution)
      
      if (onProgress) onProgress(5, undefined, `Processing ${validResolutions.length} resolutions...`)
      
      let totalChunks = 0
      let processedChunks = 0
      
      for (let i = 0; i < validResolutions.length; i++) {
        const res = validResolutions[i]
        
        if (onProgress) onProgress(10 + (i * 20), res, `Converting video to ${res}p resolution...`)
        
        const inputData = await fetchFile(file)
        
        if (typeof this.ffmpeg.writeFile === 'function') {
          await this.ffmpeg.writeFile('input.mp4', inputData)
        } else if (typeof this.ffmpeg.FS === 'function') {
          this.ffmpeg.FS('writeFile', 'input.mp4', inputData)
        } else {
          throw new Error('FFmpeg writeFile method not found')
        }
        
        const outputName = `output_${res}p.mp4`

        if (onProgress) onProgress(15 + (i * 20), res, `Encoding ${res}p video with ${PLATFORM_NAME}...`)

        await this.ffmpeg.exec([
          '-i', 'input.mp4',
          '-vf', `scale=-2:${res}`,
          '-c:v', 'libx264', '-preset', 'fast', '-crf', '30',
          '-c:a', 'aac', '-b:a', '128k',
          '-movflags', '+faststart',
          outputName
        ])

        if (onProgress) onProgress(20 + (i * 20), res, `Reading ${res}p output file...`)

        let outputData
        if (typeof this.ffmpeg.readFile === 'function') {
          outputData = await this.ffmpeg.readFile(outputName)
        } else if (typeof this.ffmpeg.FS === 'function') {
          outputData = this.ffmpeg.FS('readFile', outputName)
        } else {
          throw new Error('Video readFile method not found')
        }
        
        const blob = new Blob([outputData.buffer || outputData], { type: 'video/mp4' })

        if (onProgress) onProgress(25 + (i * 20), res, `Preparing ${res}p video for upload (${Math.round(blob.size / 1024 / 1024)}MB)...`)

        const chunksForThisResolution = Math.ceil(blob.size / CHUNK_SIZE)
        totalChunks += chunksForThisResolution
        
        for (let index = 0; index < chunksForThisResolution; index++) {
          const start = index * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, blob.size)
          const chunk = blob.slice(start, end)

          const formData = new FormData()
          formData.append('chunk', chunk)
          formData.append('index', index.toString())
          formData.append('total', chunksForThisResolution.toString())
          formData.append('filename', file.name)
          formData.append('title', file.name.replace(/\.[^/.]+$/, ""))
          formData.append('resolution', res)

          await axios.post(`${API_BASE}/videos`, formData)

          processedChunks++
          const uploadProgress = Math.round((processedChunks / totalChunks) * 60) + 30
          if (onProgress) onProgress(uploadProgress, res, `Uploading ${res}p: chunk ${index + 1}/${chunksForThisResolution}`)
        }

        if (onProgress) onProgress(85 + (i * 5), res, `Cleaning up ${res}p temporary files...`)

        result[res] = 'uploaded'
        
        try {
          if (typeof this.ffmpeg.deleteFile === 'function') {
            await this.ffmpeg.deleteFile(outputName)
            await this.ffmpeg.deleteFile('input.mp4')
          } else if (typeof this.ffmpeg.FS === 'function') {
            this.ffmpeg.FS('unlink', outputName)
            this.ffmpeg.FS('unlink', 'input.mp4')
          }
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError)
        }
      }

      if (onProgress) onProgress(100, undefined, 'All videos processed and uploaded successfully!')
      return result
    } catch (error) {
      console.error('FFmpeg processing error:', error)
      throw error
    }
  }

  static downloadVideo(downloadUrl?: string, filename?: string) {
    if (downloadUrl) window.open(downloadUrl, '_blank')
    else if (filename) {
      const link = document.createElement('a')
      link.href = `${API_BASE}/download/${filename}`
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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

  private static async getVideoResolution(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        const width = video.videoWidth
        const height = video.videoHeight
        const smallerDimension = Math.min(width, height)
        console.log(`Video dimensions: ${width}x${height}, using smaller dimension: ${smallerDimension}`)
        URL.revokeObjectURL(video.src)
        resolve(smallerDimension)
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve(720)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }
}

export default ApiService