// Fez Delivery API client (server-side only)

const BASE_URL =
  process.env.FEZ_DELIVERY_BASE_URL || "https://apisandbox.fezdelivery.co/v1";

// In-memory token cache
let cachedAuth: {
  token: string;
  secretKey: string;
  expiresAt: number;
} | null = null;

async function authenticate(): Promise<{
  token: string;
  secretKey: string;
}> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 5 * 60 * 1000) {
    return { token: cachedAuth.token, secretKey: cachedAuth.secretKey };
  }

  const userId = process.env.FEZ_DELIVERY_USER_ID;
  const password = process.env.FEZ_DELIVERY_PASSWORD;

  if (!userId || !password) {
    throw new Error("FEZ_DELIVERY_USER_ID and FEZ_DELIVERY_PASSWORD are required");
  }

  const res = await fetch(`${BASE_URL}/user/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, password }),
  });

  if (!res.ok) {
    throw new Error(`Fez auth failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.status !== "Success") {
    throw new Error(`Fez auth error: ${data.description}`);
  }

  const token = data.authDetails.authToken;
  const secretKey = data.orgDetails["secret-key"];
  const expiresAt = new Date(data.authDetails.expireToken).getTime();

  cachedAuth = { token, secretKey, expiresAt };

  return { token, secretKey };
}

function authHeaders(token: string, secretKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "secret-key": secretKey,
  };
}

// ── Public API ──

export async function getStates(): Promise<
  { id: number; state: string }[]
> {
  const { token, secretKey } = await authenticate();

  const res = await fetch(`${BASE_URL}/states`, {
    headers: authHeaders(token, secretKey),
  });

  if (!res.ok) throw new Error(`Fez states failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "Success") {
    throw new Error(`Fez states error: ${data.description}`);
  }

  return data.states;
}

export async function getDeliveryCost(
  state: string,
  weight?: number
): Promise<{
  state: string;
  cost: number;
  vat: number;
  totalCost: number;
}> {
  const { token, secretKey } = await authenticate();

  const body: Record<string, unknown> = { state };
  if (weight) body.weight = weight;

  const res = await fetch(`${BASE_URL}/order/cost`, {
    method: "POST",
    headers: authHeaders(token, secretKey),
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Fez cost failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "Success") {
    throw new Error(`Fez cost error: ${data.description}`);
  }

  return {
    state: data.cost.state,
    cost: data.cost.cost,
    vat: data.vat.vatAmount,
    totalCost: data.totalCost,
  };
}

export async function getExportLocations(): Promise<{
  locations: { id: number; name: string }[];
  weights: { id: number; name: string }[];
}> {
  const { token, secretKey } = await authenticate();

  const res = await fetch(`${BASE_URL}/orders/export-locations`, {
    headers: authHeaders(token, secretKey),
  });

  if (!res.ok) throw new Error(`Fez export locations failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "Success") {
    throw new Error(`Fez export locations error: ${data.description}`);
  }

  return {
    locations: data.data.exportLocations,
    weights: data.data.exportWeights,
  };
}

export async function getExportDeliveryCost(
  exportLocationId: number,
  weightId: number
): Promise<{
  price: number;
  discountedRate: number;
}> {
  const { token, secretKey } = await authenticate();

  const res = await fetch(`${BASE_URL}/orders/export-price`, {
    method: "POST",
    headers: authHeaders(token, secretKey),
    body: JSON.stringify({ exportLocationId, weightId }),
  });

  if (!res.ok) throw new Error(`Fez export cost failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "Success") {
    throw new Error(`Fez export cost error: ${data.description}`);
  }

  return {
    price: parseFloat(data.data.price),
    discountedRate: parseFloat(data.data.discountedRate),
  };
}

export async function trackOrder(orderNumber: string): Promise<{
  order: {
    orderNo: string;
    orderStatus: string;
    recipientName: string;
    recipientAddress: string;
    recipientState: string;
    senderName: string;
    senderAddress: string;
    createdAt: string;
  };
  history: {
    orderStatus: string;
    statusCreationDate: string;
    statusDescription: string;
  }[];
}> {
  const { token, secretKey } = await authenticate();

  const res = await fetch(
    `${BASE_URL}/order/track/${encodeURIComponent(orderNumber)}`,
    { headers: authHeaders(token, secretKey) }
  );

  if (!res.ok) throw new Error(`Fez track failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "Success") {
    throw new Error(`Fez track error: ${data.description}`);
  }

  return { order: data.order, history: data.history };
}
