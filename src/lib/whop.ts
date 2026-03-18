import Whop from "@whop/sdk";

const apiKey = process.env.WHOP_API_KEY;

if (!apiKey) {
  console.warn("WHOP_API_KEY not set");
}

export const whop = new Whop({ apiKey: apiKey || "" });

export const WHOP_COMPANY_ID = "biz_FbwE2C0ysd9MZC";
export const WHOP_PRODUCT_ID =
  process.env.WHOP_PRODUCT_ID || "prod_UZJ3lfep3YsCV";
