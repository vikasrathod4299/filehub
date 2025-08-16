import axios from "axios";
import { services } from "../config/service";
import { ServiceInstance } from "../types/services";
import { logger } from "@repo/shared";

class ServiceDiscovery {
  private serviceInstance = new Map<string, ServiceInstance>();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeServices();
  }

  // Initialize service instances from configuration
  private initializeServices() {
    Object.entries(services).forEach(([key, config]) => {
      const instance: ServiceInstance = {
        name: config.name,
        url: config.url,
        config,
        health: {
          name: config.name,
          status: "unknown",
          lastChecked: new Date(),
        },
      };
      this.serviceInstance.set(key, instance);
    });

    logger.info("Initialized services", {
      services: Array.from(this.serviceInstance.keys()),
    });
  }

  // Start the health check interval
  public startHealthCheck(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.healthCheckInterval = setInterval(() => {
      this.checkAllServices();
    }, intervalMs);

    this.checkAllServices();

    logger.info("Started health checks", { intervalMs });
  }

  // Stop the health check interval
  public stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      logger.info("Stopped health checks");
    }
  }

  // Get the health status of all services
  private async checkAllServices() {
    const promises = Array.from(this.serviceInstance.values()).map((insteace) =>
      this.checkServiceHealth(insteace),
    );
    await Promise.allSettled(promises);
  }

  // Check the health of a single service instance
  private async checkServiceHealth(instance: ServiceInstance) {
    const startTime = Date.now();

    try {
      const response = await axios.get(
        `${instance.url}${instance.config.heathEndpoint}`,
        {
          timeout: instance.config.timeout,
          validateStatus: (status) => status < 500,
        },
      );

      const responseTime = Date.now() - startTime;

      instance.health = {
        name: instance.name,
        status: response.status < 400 ? "healthy" : "unhealthy",
        lastChecked: new Date(),
        responseTime: responseTime,
        error: response.status >= 400 ? `HTTP: ${response.status}` : undefined,
      };

      if (response.status < 400) {
        logger.debug("Service heatlh check passed", {
          service: instance.name,
          responseTime,
        });
      } else {
        logger.warn("Service health check failed", {
          services: instance.name,
          status: response.status,
          responseTime,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      instance.health = {
        name: instance.name,
        status: "unhealthy",
        lastChecked: new Date(),
        responseTime: responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      logger.error("Service health check error", {
        service: instance.name,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime,
      });
    }
  }

  public getService(serviceName: string): ServiceInstance | undefined {
    return this.serviceInstance.get(serviceName);
  }

  public getAllServices(): ServiceInstance[] {
    return Array.from(this.serviceInstance.values());
  }

  public getHealthyServices(): ServiceInstance[] {
    return Array.from(this.serviceInstance.values()).filter((instance) => instance.health.status === "healthy",
    );
  }

  public isServiceHealthy(serviceName: string): boolean {
    const service = this.serviceInstance.get(serviceName);
    return service?.health.status === "healthy" ? true : false;
  }
}

export const serviceDiscovery = new ServiceDiscovery();
