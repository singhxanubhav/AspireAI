"use client"

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Play, Send, RotateCcw, CheckCircle2, XCircle, Lightbulb, Terminal, FileText, Sparkles, Maximize2, Minimize2, Code2, Trophy } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Exercise = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  hints: string[];
  difficulty: string;
  lessonTitle: string;
  courseTitle: string;
  courseSlug: string;
};

type ExistingProgress = {
  completed: boolean;
  score: number | null;
  code: string | null;
} | null;

const TABS = ["Description", "Hints"] as const;

const difficultyStyles: Record<string, { ring: string; badge: string }> = {
  EASY: { ring: "ring-green-500/20", badge: "text-green-400 bg-green-500/10" },
  MEDIUM: { ring: "ring-yellow-500/20", badge: "text-yellow-400 bg-yellow-500/10" },
  HARD: { ring: "ring-red-500/20", badge: "text-red-400 bg-red-500/10" },
};

export function PracticeExerciseClient({
  exercise,
  existingProgress,
}: {
  exercise: Exercise;
  existingProgress: ExistingProgress;
}) {
  const [code, setCode] = useState(existingProgress?.code ?? exercise.starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    correct: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"Description" | "Hints">("Description");
  const [revealedHints, setRevealedHints] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [levelUp, setLevelUp] = useState<string | null>(null);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput("");
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, exerciseId: exercise.id }),
      });
      const data = await res.json();
      setOutput(data.output || "");
    } catch {
      setOutput("Failed to run code. Check your connection.");
    } finally {
      setIsRunning(false);
    }
  }, [code, exercise.id]);

  const submitCode = useCallback(async () => {
    setIsSubmitting(true);
    setShowOutput(true);
    setOutput("Evaluating your solution...\n");
    setSubmitResult(null);
    try {
      const res = await fetch("/api/code/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, exerciseId: exercise.id }),
      });
      const data = await res.json();
      setSubmitResult({ correct: data.correct, feedback: data.feedback, score: data.score });
      setOutput(data.correct
        ? `✅ All tests passed!\n\nScore: ${data.score}/100\n\n${data.feedback}`
        : `❌ Some tests failed\n\nScore: ${data.score}/100\n\n${data.feedback}`
      );
      if (data.leveledUp) {
        setLevelUp(data.newLevel);
        setTimeout(() => setLevelUp(null), 4000);
      }
    } catch {
      setOutput("Failed to submit. Check your connection.");
      setSubmitResult({ correct: false, feedback: "Connection error", score: 0 });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, exercise.id]);

  const resetCode = useCallback(() => {
    setCode(exercise.starterCode);
    setOutput("");
    setSubmitResult(null);
    setShowOutput(false);
    setRevealedHints(0);
  }, [exercise.starterCode]);

  const ds = difficultyStyles[exercise.difficulty] || difficultyStyles.EASY;

  return (
    <>
      {levelUp && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 shadow-2xl shadow-yellow-500/30 flex items-center gap-3">
            <Trophy className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">Level Up!</p>
              <p className="text-xs text-white/80">You reached {levelUp === "MODERATE" ? "Moderate" : "Advanced"}!</p>
            </div>
          </div>
        </div>
      )}
      <div className="w-1/2 min-w-0 flex flex-col bg-white border-r border-white/10">
        <div className="shrink-0 flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-[#4F3D8A]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "Description" && <FileText className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
              {tab === "Hints" && <Lightbulb className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />}
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F3D8A]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "Description" && (
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 font-heading">
                  {exercise.title}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {exercise.courseTitle} &middot; {exercise.lessonTitle}
                </p>
              </div>

              <div className="prose prose-sm prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-strong:text-gray-900 prose-code:text-[#4F3D8A] prose-code:bg-[#EEEAFF] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs max-w-none">
                <div style={{ whiteSpace: "pre-wrap" }}>{exercise.description}</div>
              </div>

              {exercise.hints.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("Hints")}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Need a hint? ({revealedHints}/{exercise.hints.length} revealed)
                  </button>
                </div>
              )}

              {existingProgress?.completed && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Previously completed &middot; Score: {existingProgress.score}/100
                </div>
              )}
            </div>
          )}

          {activeTab === "Hints" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Hints
                <span className="text-xs text-gray-400 font-normal ml-1">
                  ({revealedHints}/{exercise.hints.length} revealed)
                </span>
              </div>

              {exercise.hints.length === 0 ? (
                <p className="text-sm text-gray-400">No hints available for this exercise.</p>
              ) : (
                <div className="space-y-3">
                  {exercise.hints.slice(0, revealedHints).map((hint, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-yellow-50 border border-yellow-200 p-4"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-yellow-200 text-yellow-800 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold text-yellow-800">
                          Hint {i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-800 leading-relaxed">{hint}</p>
                    </div>
                  ))}
                  {revealedHints < exercise.hints.length && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevealedHints((r) => Math.min(r + 1, exercise.hints.length))}
                      className="text-xs w-full border-dashed border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                    >
                      <Sparkles className="h-3 w-3 mr-1.5" />
                      Reveal Hint {revealedHints + 1}
                    </Button>
                  )}
                  {revealedHints === exercise.hints.length && exercise.hints.length > 0 && (
                    <p className="text-xs text-gray-400 text-center pt-1">
                      All hints revealed. Good luck!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-1/2 min-w-0 flex flex-col bg-[#1E1E2E]">
        <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#252536] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-white/30" />
            <span className="text-xs font-medium text-white/50">code.py</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetCode}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val ?? "")}
            options={{
              fontSize: 14,
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              tabSize: 4,
              automaticLayout: true,
              fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
              renderWhitespace: "selection",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorStyle: "line",
            }}
          />
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-[#252536]">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={runCode}
                disabled={isRunning}
                className="h-7 text-[11px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 gap-1.5"
              >
                {isRunning ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Running...
                  </span>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-emerald-400" />
                    Run
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={submitCode}
                disabled={isSubmitting}
                className="h-7 text-[11px] bg-[#4F3D8A] text-white hover:bg-[#5B4AA8] border border-[#4F3D8A]/50 gap-1.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Checking...
                  </span>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    Submit
                  </>
                )}
              </Button>
            </div>

            {showOutput && (
              <button
                onClick={() => setOutputExpanded(!outputExpanded)}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
              >
                {outputExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {showOutput && (
            <div
              className={`border-t border-white/[0.06] transition-all duration-200 ${
                outputExpanded ? "h-64" : "h-36"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-1.5 bg-black/30">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-[11px] font-mono text-white/40">console</span>
                </div>
                {output && (
                  <span className="text-[10px] text-white/20">
                    {output.length} chars
                  </span>
                )}
              </div>
              <pre className="h-[calc(100%-28px)] bg-black/20 p-4 text-[13px] font-mono leading-relaxed overflow-auto whitespace-pre-wrap text-white/80">
                {output ? (
                  output.startsWith("✅") || output.startsWith("All tests passed") ? (
                    <span className="text-emerald-400">{output}</span>
                  ) : output.startsWith("❌") || output.startsWith("Some tests failed") ? (
                    <span className="text-red-400">{output}</span>
                  ) : (
                    <span>{output}</span>
                  )
                ) : (
                  <span className="text-white/20 italic">Run your code to see output here</span>
                )}
              </pre>
            </div>
          )}

          {!showOutput && (
            <div className="border-t border-white/[0.06] bg-black/20 px-4 py-2.5">
              <p className="text-[11px] text-white/20 italic flex items-center gap-2">
                <Play className="h-3 w-3" />
                Press Run to execute your code
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
