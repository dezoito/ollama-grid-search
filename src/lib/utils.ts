import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Used to merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const asyncSleep = async (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export function convertNanosecondsToTime(interval: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  // Convert nanoseconds to seconds
  const seconds = interval / 1e9;

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const remainingSecondsAfterMinutes = remainingSeconds % 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: Math.floor(remainingSecondsAfterMinutes),
  };
}

export function convertToUTCString(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

// Outputs hours, minutes and seconds for an interval expressed in nanoseconds
export function formatInterval(interval: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return `${interval.hours}h, ${interval.minutes}m, ${interval.seconds}s`;
}

// expects the time unit to be nanoseconds (as returned by ollama)
export function tokensPerSecond(interval: number, tokens: number): number {
  // Convert nanoseconds to seconds
  const seconds = interval / 1e9;
  // Calculate tokens per second
  const tokensPerSecond = tokens / seconds;

  // Return tokens per second rounded to two decimal points
  return parseFloat(tokensPerSecond.toFixed(2));
}
