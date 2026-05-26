export type StateUpdater<T> = T | ((current: T) => T);

export function resolveValue<T>(value: StateUpdater<T>, current: T): T {
  return typeof value === "function" ? (value as (current: T) => T)(current) : value;
}
