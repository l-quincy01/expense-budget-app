import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const clerkError = error as { errors?: Array<{ message?: string }> };
    const clerkMessage = clerkError.errors?.[0]?.message;
    if (clerkMessage) return clerkMessage;

    const objectMessage = (error as { message?: unknown }).message;
    if (typeof objectMessage === "string") return objectMessage;
  }

  if (typeof error === "string") return error;

  return fallback;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);
}

export function formatCategoryName(category: string) {
  return category.replace(/([a-z])([A-Z])/g, "$1 $2").trim();
}

export function extractApiNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value === "object" && value !== null) {
    const numberValue = value as {
      $numberInt?: unknown;
      $numberDouble?: unknown;
    };

    if (typeof numberValue.$numberInt === "string") {
      return parseInt(numberValue.$numberInt, 10);
    }

    if (typeof numberValue.$numberDouble === "string") {
      return parseFloat(numberValue.$numberDouble);
    }
  }

  return 0;
}
