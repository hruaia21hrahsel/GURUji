import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/lib/system-prompt";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, userProfile } = await request.json();

    const systemPrompt = buildSystemPrompt(userProfile || {});

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
