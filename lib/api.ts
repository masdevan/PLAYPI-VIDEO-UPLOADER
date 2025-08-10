const API_BASE = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
const CHUNK_SIZE = 1024 * 1024; 
const SAFELINK_API = 'https://safelinku.com/api/v1/links'
const SAFELINK_TOKEN = '724348d396209aec8e76eefa78de660012c07c91'

export class ApiService {
  static async uploadVideo(file: File, onProgress?: (progress: number) => void) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    try {
      for (let index = 0; index < totalChunks; index++) {
        const start = index * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('index', index.toString());
        formData.append('total', totalChunks.toString());
        formData.append('filename', file.name);
        formData.append('title', file.name.replace(/\.[^/.]+$/, ""));

        const response = await fetch(`${API_BASE}/videos`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Chunk upload failed: ${response.status}`);
        }

        const progress = Math.round(((index + 1) / totalChunks) * 100);
        if (onProgress) {
          onProgress(progress);
        }

        if (index + 1 === totalChunks) {
          return response.json();
        }
      }
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async createSafelink(url: string) {
    try {
      const response = await fetch(SAFELINK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAFELINK_TOKEN}`
        },
        body: JSON.stringify({ 
          url,
          alias: '',
          passcode: ''
        })
      });

      if (!response.ok) {
        throw new Error(`Safelink creation failed: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Safelink creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default ApiService
