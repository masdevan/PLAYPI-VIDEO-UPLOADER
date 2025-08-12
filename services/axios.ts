import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API || 'http://127.0.0.1:8000/api'
const SAFELINK_API = 'https://safelinku.com/api/v1/links'
const SAFELINK_TOKEN = '724348d396209aec8e76eefa78de660012c07c91'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

export const safelinkClient = axios.create({
  baseURL: SAFELINK_API,
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${SAFELINK_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

export default {
  apiClient,
  safelinkClient,
}
