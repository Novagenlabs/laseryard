import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-3.1-flash-image-preview"; // Nano Banana 2

// Rate limit: max generations per IP per hour
const RATE_LIMIT = 5;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Extract image URL from OpenRouter response.
 * Handles multiple response formats from different models.
 */
function extractImageUrl(message: Record<string, unknown>): string | null {
  // Format 1: message.images array (Nano Banana / Gemini)
  const images = message.images as Array<{
    type?: string;
    image_url?: { url?: string };
  }> | undefined;
  if (images && images.length > 0) {
    const url = images[0]?.image_url?.url;
    if (url) return url;
  }

  // Format 2: message.content is an array of content blocks (multipart)
  const content = message.content;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (
        block &&
        typeof block === "object" &&
        "type" in block &&
        block.type === "image_url" &&
        "image_url" in block
      ) {
        const imgBlock = block as { image_url: { url?: string } };
        if (imgBlock.image_url?.url) return imgBlock.image_url.url;
      }
    }
  }

  // Format 3: message.content is a string containing a base64 data URL
  if (typeof content === "string" && content.startsWith("data:image/")) {
    return content;
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Image generation is not configured" },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { prompt, engraveImage } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build message content — engrave mask image + text prompt
    const content: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [];

    // Include the engrave mask (single image — avoids confusing the model)
    if (engraveImage && typeof engraveImage === "string") {
      content.push({
        type: "image_url",
        image_url: { url: engraveImage },
      });
    }

    content.push({
      type: "text",
      text: prompt,
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://laseryard.com",
          "X-Title": "Laser Yard Design Studio",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content,
            },
          ],
          modalities: ["image", "text"],
          image_config: {
            aspect_ratio: "4:3",
            image_size: "1K",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate image (${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const message = result.choices?.[0]?.message;

    if (!message) {
      console.error("No message in response:", JSON.stringify(result).slice(0, 500));
      return NextResponse.json(
        { error: "No response from image model" },
        { status: 502 }
      );
    }

    const imageUrl = extractImageUrl(message);
    if (imageUrl) {
      return NextResponse.json({
        imageUrl,
        text: typeof message.content === "string" ? message.content : null,
      });
    }

    // Log the full message structure to help debug extraction failures
    console.error("Could not extract image from response:", JSON.stringify(message).slice(0, 1000));
    return NextResponse.json(
      { error: "No image was generated. Try a different prompt." },
      { status: 502 }
    );
  } catch (error) {
    console.error("Design studio generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
