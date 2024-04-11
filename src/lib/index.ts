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

/**
 * Converts the given seconds and nanoseconds since epoch to a formatted date and time string.
 *
 * @param {number} secs_since_epoch - The seconds since epoch
 * @return {string} The formatted date and time string
 */
export function convertEpochToDateTime(secs_since_epoch: number): string {
  const date = new Date(secs_since_epoch * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} - ${hours}:${minutes}:${seconds}`;
}

/**
 * Check if the input is comma delimited.
 *
 * @param {string} input - the input string to be checked
 * @return {boolean} true if the input is comma delimited, false otherwise
 */
export function isCommaDelimitedList(input: string): boolean {
  // Split the string by commas
  const values = input.split(",");

  // Check if each part is a valid number (int or float with no spaces inbetweengit a)
  return values.every((val) => {
    return !isNaN(parseFloat(val.trim())) && !/\d\s+\d/.test(val.trim());
  });
}
