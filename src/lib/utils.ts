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