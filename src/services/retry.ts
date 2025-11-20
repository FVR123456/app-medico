/**
 * Retry utility for failed operations
 */

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  delay: 1000,
  backoff: true,
};

/**
 * Retry a failed operation with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry options (maxRetries, delay, backoff)
 * @returns The result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delayMs = config.backoff
        ? config.delay * Math.pow(2, attempt)
        : config.delay;

      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delayMs}ms...`,
        lastError.message
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Retry a failed operation with specific error handling
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry based on the error
      if (!shouldRetry(lastError)) {
        throw error;
      }

      // If it's the last attempt, throw the error
      if (attempt === config.maxRetries) {
        throw error;
      }

      const delayMs = config.backoff
        ? config.delay * Math.pow(2, attempt)
        : config.delay;

      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delayMs}ms...`,
        lastError.message
      );

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
