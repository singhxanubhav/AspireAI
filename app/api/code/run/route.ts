import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenAI } from "@google/genai";

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
      return Response.json({ output: "# Code execution simulator unavailable\n# GEMINI_API_KEY not configured.\n# The code would be executed in a sandbox." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a Python code executor simulator. The student wrote this Python code:\n\n\`\`\`python\n${code}\n\`\`\`\n\nSimulate what this code would output when executed. If there are errors, show the full error traceback. Return ONLY the terminal output, nothing else. Do NOT wrap in quotes or markdown.`;

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        break; // Success, exit loop
      } catch (err: any) {
        if (err?.status === 503 && retries > 1) {
          retries--;
          // Wait for 1.5 seconds before retrying to let demand spike pass
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
        throw err; // Re-throw if it's not a 503 or we're out of retries
      }
    }

    if (!result) {
        throw new Error("Failed to generate content after retries");
    }

    const output = result.text || "# No output";

    return Response.json({ output });
  } catch (error) {
    console.error("Code run API error:", error);
    return Response.json({ output: "# Error executing code\n# An unexpected error occurred." });
  }
}
