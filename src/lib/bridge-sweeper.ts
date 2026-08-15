import { sweepOpenQuestions } from "@/lib/bridge";

/**
 * In-process re-ping loop for the human bridge. Dokploy runs a single
 * persistent `next start` process, so a plain interval is enough — no
 * external cron. Timers are unref'd so they never hold a process open
 * (builds, scripts, tests).
 */

const FIRST_SWEEP_AFTER_MS = 60_000;
const SWEEP_EVERY_MS = 10 * 60_000;

declare global {
  var __bridgeSweeperStarted: boolean | undefined;
}

function unref(timer: unknown) {
  (timer as { unref?: () => void }).unref?.();
}

export function startBridgeSweeper() {
  if (globalThis.__bridgeSweeperStarted) return;
  if (!process.env.DATABASE_URL) return;
  globalThis.__bridgeSweeperStarted = true;
  console.log("bridge sweeper started (every 10 min)");

  const run = () => {
    sweepOpenQuestions()
      .then(({ pinged }) => {
        if (pinged.length) {
          console.log("bridge sweep re-pinged:", pinged.join(", "));
        }
      })
      .catch((e) => console.error("bridge sweep failed:", e));
  };

  // One early sweep catches questions that arrived while a deploy was
  // restarting the server, then the steady cadence takes over.
  unref(setTimeout(run, FIRST_SWEEP_AFTER_MS));
  unref(setInterval(run, SWEEP_EVERY_MS));
}
