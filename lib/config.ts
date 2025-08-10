export const config = {
  platform: {
    name: process.env.NEXT_PUBLIC_PLAYPI_NAME || 'PlayPi',
    description: process.env.NEXT_PUBLIC_PLAYPI_DESCRIPTION || 'A simple platform to upload and share videos with a dark theme',
    url: process.env.NEXT_PUBLIC_PLAYPI_URL || 'http://localhost:3000',
    version: process.env.NEXT_PUBLIC_PLAYPI_VERSION || '1.0.0',
  },
  video: {
    allowedFormats: (process.env.NEXT_PUBLIC_ALLOWED_VIDEO_FORMATS || 'mp4,webm,avi,mov').split(','),
  },
  development: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL,
    uploadEndpoint: process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT,
  },
  storage: {
    provider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local',
    bucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  },
  analytics: {
    id: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  },
} as const

export const isDevelopment = config.development.nodeEnv === 'development'
export const isProduction = config.development.nodeEnv === 'production'

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (!fileExtension || !config.video.allowedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `File format not supported. Allowed formats: ${config.video.allowedFormats.join(', ')}`
    }
  }

  if (!file.type.startsWith('video/')) {
    return {
      valid: false,
      error: 'File must be a video'
    }
  }

  return { valid: true }
}
