/**
 * Formatting utilities for astronomical coordinates
 */

export function formatRA(raDeg: number): string {
  // Convert degrees to hours:minutes:seconds
  const totalHours = raDeg / 15;
  const hours = Math.floor(totalHours);
  const minutesFloat = (totalHours - hours) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = ((minutesFloat - minutes) * 60).toFixed(1);
  return `${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m ${seconds.padStart(4, "0")}s`;
}

export function formatDec(decDeg: number): string {
  const sign = decDeg >= 0 ? "+" : "-";
  const abs = Math.abs(decDeg);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = ((minutesFloat - minutes) * 60).toFixed(0);
  return `${sign}${degrees.toString().padStart(2, "0")}° ${minutes
    .toString()
    .padStart(2, "0")}' ${seconds.padStart(2, "0")}"`;
}

export function formatFOV(fovDeg: number): string {
  if (fovDeg < 1) {
    return `${(fovDeg * 60).toFixed(1)}'`;
  }
  return `${fovDeg.toFixed(1)}°`;
}
