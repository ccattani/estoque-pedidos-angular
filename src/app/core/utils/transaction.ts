export function withTransaction<T, Snapshot>(
  snapshot: () => Snapshot,
  restore: (snapshot: Snapshot) => void,
  work: () => T
): T {
  const state = snapshot();

  try {
    return work();
  } catch (error) {
    restore(state);
    throw error;
  }
}
