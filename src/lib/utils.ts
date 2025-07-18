import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'isomorphic-dompurify';
import {logger} from "@/lib/logger";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeUserInput(input: string): string {
  // First, trim and check for empty strings
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Configure DOMPurify with strict settings
  const clean = DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    RETURN_TRUSTED_TYPE: false,
    // Additional safety: remove dangerous elements
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  // Additional validation: check for SQL/NoSQL injection patterns
  const injectionPatterns = [
    /(\$where|\$regex|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin)/gi,
    /(union\s+select|insert\s+into|drop\s+table)/gi,
    /(<script|javascript:|onerror=|onload=)/gi,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(clean)) {
      // Log potential attack attempt
      logger.warn('Potential injection attempt detected', {
        pattern: pattern.toString(),
        input: clean.substring(0, 50) + '...',
      });
      // Return empty or throw error based on your security policy
      return '';
    }
  }

  return clean;
}

// For MongoDB field names (extra strict)
export function sanitizeFieldName(fieldName: string): string {
  // Only allow alphanumeric, dots for nested fields, and underscores
  return fieldName.replace(/[^a-zA-Z0-9._]/g, '');
}

// For search queries - prevent NoSQL injection
export function sanitizeSearchQuery(query: string): string {
  // Remove special MongoDB operators
  return query.replace(/[$\{\}]/g, '');
}

/**
 * Deeply compares two values to determine if they are equal.
 * Supports strings, numbers, booleans, null, undefined, arrays, and objects.
 *
 * @param {*} a The first value to compare.
 * @param {*} b The second value to compare.
 * @returns {boolean} True if the values are deeply equal, false otherwise.
 */
export function deepEqual(a, b) {
  // 1. Strict equality check for primitives and same object reference
  if (a === b) {
    return true;
  }

  // 2. Check if a and b are both non-null objects. If not, they can't be deeply equal.
  if (a === null || typeof a !== 'object' || b === null || typeof b !== 'object') {
    return false;
  }

  // 3. Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    // a. Compare array lengths
    if (a.length !== b.length) {
      return false;
    }
    // b. Recursively compare each element
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // 4. Handle Objects
  if (Array.isArray(a) || Array.isArray(b)) {
    // If one is an array and the other is an object
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // a. Compare the number of keys
  if (keysA.length !== keysB.length) {
    return false;
  }

  // b. Check if all keys exist and their values are recursively equal
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  // 5. If all checks pass, the objects are equal
  return true;
}
