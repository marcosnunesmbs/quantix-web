import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extracts the API `message` field from an Axios error response, falling back to `fallback`. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as any).response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }
  return fallback;
}
