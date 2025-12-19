import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Centralized error handling; could dispatch to store or show toast
    console.error("Global error:", error);
    alert("An error occurred. See console for details.");
  }
}
