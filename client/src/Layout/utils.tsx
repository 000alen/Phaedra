export function clamp(num: number, min: number, max: number): number {
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

export function removeFromArray<T>(array: T[], item: T): void {
  const index = array.indexOf(item);
  if (index === -1) throw new Error("Unexpected error");
  array.splice(index, 1);
}
