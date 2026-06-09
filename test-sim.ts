import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a Python code executor simulator. The student wrote this Python code:

\`\`\`python
print("Hello World")
\`\`\`

Simulate what this code would output when executed. If there are errors, show the full error traceback. Return ONLY the terminal output, nothing else. Do NOT wrap in quotes or markdown.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    console.log("Output:", result.text);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
