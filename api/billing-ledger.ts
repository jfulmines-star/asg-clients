// Stub billing-ledger — satisfies import without breaking runtime
export async function recordUsage(_params: {
  client: string; slug: string; model: string;
  inputTokens: number; outputTokens: number; feature: string;
}) {
  return { over80: false };
}

export async function hasAlert80BeenSent(_client: string): Promise<boolean> {
  return false;
}

export async function markAlert80Sent(_client: string): Promise<void> {
  // no-op stub
}
