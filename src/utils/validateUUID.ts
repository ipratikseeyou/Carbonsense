
/**
 * Validates if a string is a valid UUID v4 format
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isValidUUID(uuid: string | undefined): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Type guard to check if a value is a valid UUID string
 */
export function isUUID(value: unknown): value is string {
  return typeof value === 'string' && isValidUUID(value);
}
