/**
 * Uses a case insensitive regex match to jank-ily pull the param name (as
 * paramName=something) from the URL search part.
 */
export function getUrlSearchStringParam(paramName: string): string | null {
  if (typeof window === 'undefined' || !paramName) {
    return null;
  }

  const regex = new RegExp(`(\\?|&|^)${paramName}=([^&]+)(&|$)`, 'i');
  const matches = window.location.search.match(regex);

  if (matches && matches.length >= 3) {
    return matches[2];
  }

  return null;
}
