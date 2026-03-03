import { toast } from "sonner";
import { logger } from "./loggingService";
import { ERROR_MESSAGES } from "@/config/constants";

/**
 * Centralized error handling service
 * Standardizes error handling and user feedback across the application
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
}

class ErrorService {
  /**
   * Handle and display an error to the user
   */
  handleError(error: unknown, userMessage?: string): void {
    const appError = this.parseError(error);

    // Log the error
    logger.error(
      appError.message,
      appError.originalError instanceof Error
        ? appError.originalError
        : undefined,
      { code: appError.code, statusCode: appError.statusCode },
    );

    // Show toast to user
    const displayMessage = userMessage || this.getUserFriendlyMessage(appError);
    toast.error(displayMessage);
  }

  /**
   * Parse unknown error into AppError format
   */
  private parseError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        message: error.message,
        originalError: error,
      };
    }

    if (typeof error === "string") {
      return {
        message: error,
        originalError: error,
      };
    }

    if (error && typeof error === "object" && "message" in error) {
      return {
        message: String(error.message),
        code: "code" in error ? String(error.code) : undefined,
        statusCode:
          "statusCode" in error ? Number(error.statusCode) : undefined,
        originalError: error,
      };
    }

    return {
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      originalError: error,
    };
  }

  /**
   * Get user-friendly message based on error
   */
  private getUserFriendlyMessage(error: AppError): string {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes("invalid login") ||
      message.includes("invalid credentials")
    ) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }

    if (
      message.includes("already registered") ||
      message.includes("email already")
    ) {
      return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
    }

    if (
      message.includes("authentication required") ||
      message.includes("not authenticated")
    ) {
      return ERROR_MESSAGES.AUTH_REQUIRED;
    }

    if (message.includes("session") || message.includes("token expired")) {
      return ERROR_MESSAGES.SESSION_EXPIRED;
    }

    // Network errors
    if (message.includes("network") || message.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Default to the error message or unknown error
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  /**
   * Handle async function with error handling
   */
  async handle<T>(
    fn: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, errorMessage);
      return null;
    }
  }
}

// Export singleton instance
export const errorService = new ErrorService();
