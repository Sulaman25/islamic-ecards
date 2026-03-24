import { auth } from "@/auth";
import {
  anthropic,
  buildIslamicGreetingPrompt,
  MessageGenerationParams,
} from "@/lib/ai/claude";
import { prisma } from "@/lib/db/prisma";

// Rate limits: free users 10/hr, paid users 100/hr
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, plan: string): boolean {
  const limit = plan === "FREE" ? 10 : 100;
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3600000 });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (user.plan === "FREE") {
    return new Response(
      JSON.stringify({ error: "AI message generation requires a paid plan" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!checkRateLimit(session.user.id, user.plan)) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  let params: MessageGenerationParams;
  try {
    params = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!params.occasion || !params.recipientName || !params.senderName) {
    return new Response("Missing required fields", { status: 400 });
  }

  const prompt = buildIslamicGreetingPrompt(params);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
