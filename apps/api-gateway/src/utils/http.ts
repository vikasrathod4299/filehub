import axios from 'axios';
import { Request } from 'express';
import { ApiError } from '@repo/shared';

export const forwardRequest = async (serviceUrl: string, req: Request) => {
  try {
    // Configure axios with timeout and proper headers
    const axiosConfig = {
      method: req.method.toLowerCase() as any,
      url: `${serviceUrl}${req.originalUrl}`,
      data: req.body,
      headers: {
        ...req.headers,
        // Remove host header to avoid conflicts
        host: undefined,
        // Remove content-length as axios will set it
        'content-length': undefined,
        // Ensure proper content-type
        'content-type': req.headers['content-type'] || 'application/json'
      },
      timeout: 30000, // 30 second timeout
      validateStatus: (status: number) => status < 500, // Don't throw on 4xx errors
      maxRedirects: 5,
      // Important: Handle keep-alive properly
      httpAgent: undefined, // Let axios handle connection pooling
      httpsAgent: undefined
    };
    console.log('Axios config:', {
      method: axiosConfig.method,
      url: axiosConfig.url,
      timeout: axiosConfig.timeout,
      headers: Object.keys(axiosConfig.headers)
    });

    const res = await axios(axiosConfig);
    
    console.log(`Response received from ${serviceUrl}:`, {
      status: res.status,
      statusText: res.statusText,
      headers: Object.keys(res.headers)
    });
    
    return res;
    
  } catch (error:any) {
    console.error('Error forwarding request:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      serviceUrl,
      originalUrl: req.originalUrl
    });
    
    // Re-throw with more context
    throw new ApiError(500, `Failed to forward request error:${error.message}`)
  }
};

// Alternative implementation with better error handling and retries
export const forwardRequestWithRetry = async (
  serviceUrl: string, 
  req: Request, 
  maxRetries: number = 3
) => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} - Forwarding to ${serviceUrl}`);
      
      const axiosConfig = {
        method: req.method.toLowerCase() as any,
        url: `${serviceUrl}${req.originalUrl}`,
        data: req.body,
        headers: {
          ...req.headers,
          host: undefined,
          'content-length': undefined,
          'user-agent': 'API-Gateway/1.0'
        },
        timeout: 15000, // Shorter timeout for retries
        validateStatus: (status: number) => status < 500,
        // Connection pooling settings
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      };

      const res = await axios(axiosConfig);
      console.log(`Success on attempt ${attempt}`);
      return res;
      
    } catch (error:any) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
