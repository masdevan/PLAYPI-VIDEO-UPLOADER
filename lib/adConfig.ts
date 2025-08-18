export const AD_CONFIG = {
  FALLBACK_URL: 'https://example.com/ads',
  
  getExternalTarget: (): string => {
    const envUrl = process.env.NEXT_PUBLIC_DIRECT_LINK_ADS
    if (envUrl) {
      console.log('Using environment variable for ads:', envUrl)
      return envUrl
    }
    
    console.warn('No NEXT_PUBLIC_DIRECT_LINK_ADS found, using fallback URL')
    return AD_CONFIG.FALLBACK_URL
  },
  
  isEnabled: (): boolean => {
    const target = AD_CONFIG.getExternalTarget()
    return target !== AD_CONFIG.FALLBACK_URL
  }
}

export default AD_CONFIG
