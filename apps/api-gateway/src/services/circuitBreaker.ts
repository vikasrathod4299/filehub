import { logger } from "@repo/shared";
import { ServiceUnavailableError } from "@repo/shared";
import { services } from "../config/service";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private nextAttemptTime?: Date;

  constructor(
    private serviceName: string,
    private options: CircuitBreakerOptions,
  ) { }

  public async exicute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        logger.info("Circuit breaker half-open", { service: this.serviceName });
      } else {
        throw new ServiceUnavailableError(this.serviceName);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.options.resetTimeout);

      logger.warn("Circuit breaker opened", {
        service: this.serviceName,
        failureCount: this.failureCount,
        resetTime: this.nextAttemptTime,
      });
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.nextAttemptTime !== undefined && new Date() >= this.nextAttemptTime
    );
  }

  public getState() {
    return this.state;
  }

  public getStaus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailuretime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

export const circuitBreaker = new Map<string, CircuitBreaker>();

//Initialize circuit breaker
Object.keys(services).forEach((serviceName) => {
  circuitBreaker.set(
    serviceName,
    new CircuitBreaker(serviceName, {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
    }),
  );
});
