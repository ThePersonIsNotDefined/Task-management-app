export function groupBy<T, K extends string | number>(
  items: readonly T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return items.reduce<Record<K, T[]>>((groups, item) => {
    const key = keyFn(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(items: readonly T[], compareFn: (first: T, second: T) => number): T[] {
  return [...items].sort(compareFn);
}

export function filterByPredicate<T>(items: readonly T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

export function uniqueBy<T, K>(items: readonly T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}