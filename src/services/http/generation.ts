const STORAGE_KEY = 'jungle:transport-generation';
let memory: string | undefined;
let pendingPersistence = false;
let epoch = 0;

function acceptGeneration(value: string, transition = false) {
  // Initial discovery must not invalidate a login that is already in flight.
  if ((memory !== undefined && memory !== value) || transition) epoch++;
  memory = value;
}

/** Keep the last accepted generation even when the browser temporarily blocks storage. */
export function readGeneration(): string | undefined {
  try {
    if (pendingPersistence && memory) {
      sessionStorage.setItem(STORAGE_KEY, memory);
      pendingPersistence = false;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) acceptGeneration(stored);
  } catch {
    // The in-memory generation remains the authority until persistence is available again.
  }
  return memory;
}

export function readGenerationSnapshot() {
  const generation = readGeneration();
  return { generation, epoch };
}

export function rememberGeneration(value: unknown, transition = false) {
  const generation = Number(value);
  if (!Number.isSafeInteger(generation) || generation <= 0) return;
  const accepted = String(generation);
  acceptGeneration(accepted, transition);
  pendingPersistence = true;
  try {
    sessionStorage.setItem(STORAGE_KEY, accepted);
    pendingPersistence = false;
  } catch {
    // Retain the newer generation before any later request or response can inspect it.
  }
}
