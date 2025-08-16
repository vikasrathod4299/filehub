import { serviceDiscovery } from "./serviceDiscovery";


export interface GatewayHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  timestamp: string;
  uptime: number;
  services: Array<{
    name: string;
    status:string;
    responseTime: number;
    lastChecked: Date;
    error?: string;
  }>;
  system: {
    memory: {
      used: number,
      total: number;
      percentage: number;
    },
    cpu: {
      usage: number;
    }
  }
}

export class HealthCheckService {
  private startTime = Date.now();

  public async getHealth(): Promise<GatewayHealth> {

    const services = serviceDiscovery.getAllServices()
    const healthySerivces = serviceDiscovery.getHealthyServices()

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded'

    if (healthySerivces.length === services.length) {
      overallStatus = 'healthy'
    } else if (healthySerivces.length > 0) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'unhealthy'
    }

    const memUsage = process.memoryUsage();

    return {
      status: overallStatus,
      timestamp:new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      services:services.map(service => ({
        name:service.name,
        status: service.health.status,
        responseTime: service.health.responseTime || 0,
        lastChecked:service.health.lastChecked,
        error:service.health.error,
      })),
      system: {
        memory: {
          used:memUsage.heapUsed,
          total: memUsage.heapTotal,
          percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
        },
        cpu: {
          usage: process.cpuUsage().user / 1000000
        }
      }
    }
  }
}

export const healthCheckService = new HealthCheckService();

