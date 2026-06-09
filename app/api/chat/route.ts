import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are Astra, a friendly AI coding buddy created by AspireAI. Your job is to help students learn to code.

Guidelines:
- Explain things very simply, as if to a beginner student. You can use simple English or Hinglish if it helps make it friendlier.
- Keep sentences short and easy to read.
- DO NOT dump large blocks of text or code at once. Break it down into small, digestible steps.
- Celebrate small wins and be encouraging!
- Use bullet points, bold text, and emojis to make it look nice and clean on the UI.
- When showing code, format it properly with markdown code blocks using triple backticks.
- If the student is stuck, give a small hint rather than the full solution.
- Stay on topic. Focus on coding, computer science, and AI.`;

function buildContents(
  history: { role: string; content: string }[],
  message: string,
) {
  const contents: { role: string; parts: { text: string }[] }[] = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: "model",
      parts: [
        {
          text: "Understood! I'm Astra, your friendly AI coding buddy. I'll help students learn to code with simple explanations and encouragement.",
        },
      ],
    },
  ];

  for (const msg of history) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  contents.push({ role: "user", parts: [{ text: message }] });

  return contents;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          response:
            "Astra is currently unavailable — the AI key hasn't been configured yet. Please ask your instructor to set up GEMINI_API_KEY.",
        },
        { status: 200 },
      );
    }

    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "USER",
        content: message,
        context: context || null,
      },
    });

    const recentHistory = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { role: true, content: true },
    });

    const history = recentHistory
      .reverse()
      .map((h) => ({
        role: h.role === "USER" ? "user" : "assistant",
        content: h.content,
      }))
      .slice(-20);

    const ai = new GoogleGenAI({ apiKey });

    const contents = buildContents(history, message);

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents,
    });

    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = "";
        try {
          for await (const chunk of responseStream) {
            const chunkText = chunk.text || "";
            fullReply += chunkText;
            controller.enqueue(new TextEncoder().encode(chunkText));
          }
          
          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: fullReply,
              context: context || null,
            },
          });
        } catch (error) {
          console.error("Streaming error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { response: "Oops! Astra hit a hiccup. Could you try asking again?" },
      { status: 200 },
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      context: true,
      createdAt: true,
    },
  });

  return Response.json({ messages });
}
