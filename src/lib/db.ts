import { neon, NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

let cached: Sql | null = null;

// The Neon driver talks HTTP to Neon's endpoint, so it can't reach a plain
// Postgres on localhost. For local development we fall back to the `pg`
// driver (a devDependency) behind the same tagged-template call shape, so
// nothing downstream has to care which one is in use.
function isLocalPostgres(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

function localDb(url: string): Sql {
  // Required lazily and only off the Neon path, so `pg` never needs to be
  // present in a production install.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const { Pool } = require("pg") as typeof import("pg");
  /* eslint-enable @typescript-eslint/no-require-imports */
  const pool = new Pool({ connectionString: url });

  // neon() is called as a tagged template: sql`SELECT ... ${value}`. Rebuild
  // the statement with $1, $2, … placeholders so values stay parameterised.
  const tagged = (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.reduce(
      (acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""),
      ""
    );
    return pool.query(text, values).then((r) => r.rows);
  };

  return tagged as unknown as Sql;
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!cached) {
    cached = isLocalPostgres(url) ? localDb(url) : neon(url);
  }
  return cached;
}
