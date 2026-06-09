import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";
import { calculateLevel } from "@/lib/levelCalculator";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, exerciseId } = await req.json();
    if (!code || !exerciseId) {
      return Response.json({ error: "Code and exerciseId are required" }, { status: 400 });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) {
      return Response.json({ error: "Exercise not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({
        correct: false,
        feedback: "Code submission checker unavailable — GEMINI_API_KEY not configured.",
        score: 0,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a code review assistant. Compare this student code to the expected solution.

Student code:
\`\`\`python
${code}
\`\`\`

Expected solution:
\`\`\`python
${exercise.solution}
\`\`\`

Exercise description: ${exercise.description}

Is the student code functionally correct? Reply with valid JSON only (no markdown, no backticks):
{ "correct": boolean, "feedback": "string", "score": number (0-100) }`;

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        break;
      } catch (err: any) {
        if (err?.status === 503 && retries > 1) {
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
        throw err;
      }
    }

    if (!result) {
        throw new Error("Failed to generate content after retries");
    }

    let parsed;
    try {
      const text = result.text || "{}";
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { correct: false, feedback: "Unable to evaluate your solution. Please try again.", score: 0 };
    }

    const { correct, feedback, score } = parsed;
    const isPassing = score >= 70;

    await prisma.exerciseProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
      create: {
        userId: session.user.id,
        exerciseId,
        completed: isPassing,
        score,
        code,
        completedAt: isPassing ? new Date() : null,
      },
      update: {
        completed: isPassing ? true : undefined,
        score,
        code,
        completedAt: isPassing ? new Date() : undefined,
      },
    });

    let leveledUp = false;
    let newLevel: string | undefined;
    if (isPassing) {
      const completedCount = await prisma.userProgress.count({
        where: { userId: session.user.id, completed: true },
      });
      newLevel = calculateLevel(completedCount);
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { codingLevel: true },
      });
      if (user && user.codingLevel !== newLevel) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { codingLevel: newLevel as any },
        });
        leveledUp = true;
      }
    }

    return Response.json({ correct, feedback, score, leveledUp, newLevel });
  } catch (error) {
    console.error("Code submit API error:", error);
    return Response.json({
      correct: false,
      feedback: "An unexpected error occurred while evaluating your code.",
      score: 0,
    });
  }
}
