import {ServiceConfig} from  '../config/service'

export interface ServiceHealth{
  name: string;
  status: 'healthy' | 'degraded' | 'unknown' | 'unhealthy';
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

export interface ServiceInstance {
  name:string;
  url: string;
  health:ServiceHealth;
  config:ServiceConfig;
}
