// One-time setup for the order tracking tables on Neon.
// Usage: DATABASE_URL="postgres://..." node scripts/setup-orders-db.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number text NOT NULL UNIQUE,
    customer_name text NOT NULL,
    customer_phone text,
    item_description text NOT NULL,
    destination text,
    design_url text,
    status text NOT NULL DEFAULT 'received'
      CHECK (status IN ('received', 'in_production', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS order_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status text NOT NULL,
    note text,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON order_events(order_id)
`;

await sql`
  CREATE TABLE IF NOT EXISTS designs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filename text NOT NULL,
    content_type text NOT NULL,
    data text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )
`;

// migration for tables created before design_url existed
await sql`
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS design_url text
`;

console.log("orders + order_events + designs tables ready");
