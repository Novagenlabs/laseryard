/**
 * Next.js instrumentation hook — runs once when the server boots.
 * Starts the human-bridge re-ping sweeper (skipped during builds and in
 * non-node runtimes).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const { startBridgeSweeper } = await import("@/lib/bridge-sweeper");
  startBridgeSweeper();
}
