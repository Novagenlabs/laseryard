# Order Tracking (Neon Postgres)

Customers track orders on `/track` with just an order number. No login. State lives in the Neon Postgres database.

The `/track` page is a minimal search bar. Submitting navigates to `/track?order=LY-XXXX-XXXX`, which fetches and shows the full job ticket — so order links are shareable directly (send the customer that URL on WhatsApp).

## Setup

1. Set two environment variables (locally in `.env.local`, and in the deploy environment):

```
DATABASE_URL=postgres://...   # Neon connection string (pooled endpoint is fine)
ORDERS_ADMIN_KEY=<long random secret>   # e.g. openssl rand -hex 32
```

`ORDERS_ADMIN_KEY` accepts multiple comma-separated keys — give each connected app (admin console, Hermes, POS, ...) its own key so any one can be revoked without breaking the others.

2. Create the tables (one-time):

```
DATABASE_URL="postgres://..." node scripts/setup-orders-db.mjs
```

## Data model

- `orders` — one row per order: `tracking_number` (unique, e.g. `LY-7K2M-QX4H`), `customer_name`, `customer_phone`, `item_description`, `destination`, `design_url` (optional image/SVG of the job, shown on the ticket plate; host it under `public/designs/`), `status`, timestamps.
- `order_events` — append-only timeline shown to the customer: status + note + timestamp.

Statuses: `received` → `in_production` → `shipped` → `out_for_delivery` → `delivered`, plus `cancelled`.

## Orders Console (local app)

`tools/orders-console.html` is a standalone local console — it is NOT served by the website. Open the file directly in a browser (`open tools/orders-console.html`), point it at the API base (production or http://localhost:3000), paste an API key once, and you can create orders, flip statuses, and copy customer share links. It talks to the admin API below over CORS; settings stay in that browser.

## Admin API (Bearer ORDERS_ADMIN_KEY)

Any app with a key can drive orders programmatically.

List recent orders:

```
curl https://laseryard.com/api/orders -H "Authorization: Bearer $ORDERS_ADMIN_KEY"
```

Create an order (tracking number auto-generated unless you pass one):

```
curl -X POST https://laseryard.com/api/orders \
  -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Ada O.","itemDescription":"50x metal business cards","customerPhone":"+2348012345678","destination":"Lagos","designUrl":"/designs/ada-card.svg"}'
```

Response includes `order.trackingNumber` — send that to the customer on WhatsApp.

Upload artwork (stored in Neon, survives deploys; returns the `designUrl` to attach to an order):

```
curl -X POST https://laseryard.com/api/designs \
  -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  -F "file=@card.svg"
```

Edit order details (silent, no timeline event; empty string clears an optional field):

```
curl -X PATCH https://laseryard.com/api/orders/LY-7K2M-QX4H \
  -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"itemDescription":"75x metal cards","designUrl":"/api/designs/<id>"}'
```

Update status (adds a timeline event; `note` optional, a sensible default is used):

```
curl -X PATCH https://laseryard.com/api/orders/LY-7K2M-QX4H \
  -H "Authorization: Bearer $ORDERS_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped","note":"Handed to Fez, waybill 12345"}'
```

Fetch full order (admin view, includes phone):

```
curl https://laseryard.com/api/orders/LY-7K2M-QX4H \
  -H "Authorization: Bearer $ORDERS_ADMIN_KEY"
```

## Public API

`POST /api/orders/track` with `{"trackingNumber":"LY-..."}`. Rate-limited to 30 lookups/IP/hour. Never returns the customer's phone number.

## Notes

- The old courier-based tracking (`/api/shipping/track` → Fez) still exists but the `/track` page no longer uses it.
- Tracking numbers use an unambiguous charset (no 0/O, 1/I/L) so they read back cleanly over WhatsApp or phone.
