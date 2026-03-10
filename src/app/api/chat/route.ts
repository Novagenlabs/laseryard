import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-001";

const SYSTEM_PROMPT = `You are the Laser Yard AI assistant -a friendly, professional customer service rep for Laser Yard, a precision laser engraving studio headquartered in Lagos, Nigeria, serving clients worldwide.

COMPANY INFO:
- Name: Laser Yard
- Headquarters: Lagos, Nigeria
- Hours: Monday–Friday 9am–6pm WAT, Saturday 10am–3pm WAT
- WhatsApp: Contact us via the WhatsApp button on our website
- Email: hello@laseryard.com
- Website: laseryard.com
- We serve clients globally -Africa, Europe, the Americas, Middle East, and Asia

CORE PRODUCT -METAL BUSINESS CARDS:
- Materials: Stainless steel (silver, gold, black, rose gold finishes)
- Thickness options: 0.4mm (standard), 0.8mm (premium)
- Engraving: Laser-cut text, logos, QR codes, intricate patterns
- Finish options: Matte, glossy, brushed
- Standard size: 85mm × 55mm (same as traditional cards)
- Custom shapes and sizes available
- Minimum order: 25 cards
- Volume discounts: Orders of 500+ cards receive 10% discount

PRICING GUIDANCE:
- Pricing depends on material, thickness, finish, quantity, and design complexity
- Do NOT quote exact prices -instead say "pricing starts from..." or direct them to WhatsApp for a custom quote
- Stainless steel cards start from around $2.50 per card for bulk orders (500+)
- Small orders (25-100) are priced higher per unit
- Design setup fee may apply for complex custom work

OTHER SERVICES:
- Custom signage (indoor/outdoor, metal/acrylic)
- Wood engraving (plaques, awards, gifts)
- Acrylic engraving (awards, displays, keychains)
- Leather engraving (wallets, bags, accessories)
- Glass engraving (awards, drinkware)

ORDERING PROCESS:
1. Contact via WhatsApp or website
2. Share design (AI, EPS, PDF vector, or high-res PNG 300+ DPI)
3. Receive digital proof for approval
4. Pay 50% deposit to start production
5. Production: 5–7 business days (standard), 2–3 days (rush, extra fee)
6. Pay remaining 50% before shipping
7. Delivery

PAYMENT:
- 50% deposit required upfront
- Bank transfer (Nigerian and international banks)
- Mobile money
- International wire transfers
- Other methods can be discussed based on customer's location

SHIPPING:
- Lagos: Same-day/next-day delivery available
- Other Nigerian cities: 2–4 business days via courier
- International: 7–14 business days depending on destination
- Shipping cost depends on order size and destination -quote per order for international

BEHAVIOR RULES:
- Be concise -keep answers to 2–3 sentences when possible
- Be warm and professional, use simple English
- For complex quotes, custom designs, or large orders: redirect to WhatsApp
- If you don't know something, say so honestly and suggest they contact the team on WhatsApp
- Never make up prices, timelines, or guarantees
- Don't discuss competitors
- You can answer in the customer's language if they write in one (e.g., Pidgin English, French)`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Chat service is not configured." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json(
      { error: "Messages are required." },
      { status: 400 }
    );
  }

  // Sanitize: only user/assistant roles, last 20 messages
  const messages = rawMessages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-20);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "No valid messages provided." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://laseryard.com",
          "X-Title": "Laser Yard Chat",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          stream: true,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("OpenRouter error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to get a response. Please try again." },
        { status: 502 }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "No response stream available." },
        { status: 502 }
      );
    }

    // Transform OpenAI SSE stream into simplified format
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            controller.enqueue(
              new TextEncoder().encode("data: [DONE]\n\n")
            );
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") {
              controller.enqueue(
                new TextEncoder().encode("data: [DONE]\n\n")
              );
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ content })}\n\n`
                  )
                );
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      },
      cancel() {
        reader.cancel();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
