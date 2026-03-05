/**
 * Pure utility functions for time formatting and manipulation
 */

/**
 * Formats milliseconds into mm:ss format allowing minutes > 59
 * @param ms - Milliseconds to format
 * @returns Formatted string in mm:ss format
 */
export function formatDurationMmSs(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
