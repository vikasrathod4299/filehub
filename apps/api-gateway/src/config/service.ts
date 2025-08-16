export interface ServiceConfig {
  name: string;
  url: string;
  heathEndpoint: string;
  timeout: number;
  retries: number;
}

export const services:Record<string, ServiceConfig> = {
  auth: {
    name: 'Auth Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    heathEndpoint: '/health',
    timeout: 10000, // 5 seconds
    retries: 3,
  },
  upload: {
    name: 'Upload Service',
    url: process.env.UPLOAD_SERVICE_URL || 'http://localhost:3002',
    heathEndpoint: '/health',
    timeout: 30000, // 5 seconds
    retries: 2,
  }

}
