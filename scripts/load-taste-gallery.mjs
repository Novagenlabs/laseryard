#!/usr/bin/env node
/**
 * Load the staged taste-gallery images into the design_concepts table under
 * the _TASTE sentinel, directly against the app's database. Same write the
 * admin endpoint performs; used to seed the gallery before/without a deploy.
 * Idempotent: a file whose label already exists in the gallery is skipped.
 *
 * Usage: node scripts/load-taste-gallery.mjs [folder]
 * DATABASE_URL comes from the environment or .env.local; it is never printed.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { neon } from "@neondatabase/serverless";

const folder =
  process.argv[2] ||
  join(process.env.HOME, "Desktop", "laseryard-taste-gallery");

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Worktrees do not carry the gitignored .env.local; fall back to the main
  // checkout's copy. The value is only handed to the driver, never printed.
  const candidates = [
    join(process.cwd(), ".env.local"),
    join(process.env.HOME, "Documents", "code", "laser_yard", ".env.local"),
  ];
  for (const path of candidates) {
    let env;
    try {
      env = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    const line = env
      .split("\n")
      .find((l) => l.trim().startsWith("DATABASE_URL="));
    if (line) {
      return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("DATABASE_URL not found in env or .env.local");
}

const sql = neon(databaseUrl());

await sql`
  CREATE TABLE IF NOT EXISTS design_concepts (
    id SERIAL PRIMARY KEY,
    order_ref TEXT NOT NULL,
    label TEXT,
    style TEXT,
    content_type TEXT NOT NULL,
    data TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

const existing = new Set(
  (await sql`SELECT label FROM design_concepts WHERE order_ref = '_TASTE'`).map(
    (r) => r.label
  )
);

const files = readdirSync(folder)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort();
if (files.length === 0) throw new Error("No PNGs in " + folder);

let added = 0;
let sort = existing.size;
for (const file of files) {
  const label = basename(file, ".png");
  if (existing.has(label)) {
    console.log(`skip  ${label} (already in gallery)`);
    continue;
  }
  const data = readFileSync(join(folder, file));
  if (!data.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    console.log(`skip  ${label} (not a png)`);
    continue;
  }
  await sql`
    INSERT INTO design_concepts (order_ref, label, style, content_type, data, sort)
    VALUES ('_TASTE', ${label}, NULL, 'image/png', ${data.toString("base64")}, ${sort++})
  `;
  console.log(`added ${label}  ${Math.round(data.length / 1024)} KB`);
  added++;
}

const live = await sql`
  SELECT count(*)::int AS n FROM design_concepts
  WHERE order_ref = '_TASTE' AND archived = false
`;
console.log(`\n${added} added, gallery now holds ${live[0].n} live designs`);
