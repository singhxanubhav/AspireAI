"use client"

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Send, ChevronDown, Lightbulb, RotateCcw, CheckCircle2, XCircle, Sparkles, Terminal, BookOpen, ChevronLeft, AlertCircle } from "lucide-react";

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

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD: "bg-red-100 text-red-700 border-red-200",
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
  const [revealedHints, setRevealedHints] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput("> Running...\n");
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, exerciseId: exercise.id }),
      });
      const data = await res.json();
      setOutput(data.output || "# No output");
    } catch {
      setOutput("# Failed to run code. Check your connection.");
    } finally {
      setIsRunning(false);
    }
  }, [code, exercise.id]);

  const submitCode = useCallback(async () => {
    setIsSubmitting(true);
    setShowOutput(false);
    setSubmitResult(null);
    try {
      const res = await fetch("/api/code/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, exerciseId: exercise.id }),
      });
      const data = await res.json();
      setSubmitResult({
        correct: data.correct,
        feedback: data.feedback,
        score: data.score,
      });
    } catch {
      setSubmitResult({
        correct: false,
        feedback: "Failed to submit. Check your connection.",
        score: 0,
      });
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

  return (
    <>
      <div className={`flex-1 overflow-y-auto border-r border-border/50 ${showDescription ? "" : "hidden lg:flex"}`}>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">
                {exercise.courseTitle} &middot; {exercise.lessonTitle}
              </p>
            </div>
            <button
              onClick={() => setShowDescription(false)}
              className="lg:hidden text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="prose prose-sm prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-brand-primary prose-code:bg-brand-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs max-w-none">
            <div dangerouslySetInnerHTML={{ __html: exercise.description.replace(/\n/g, "<br/>") }} />
          </div>

          {exercise.hints.length > 0 && (
            <Collapsible className="w-full">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full py-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Hints ({revealedHints}/{exercise.hints.length})
                <ChevronDown className="h-3.5 w-3.5 ml-auto transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {exercise.hints.slice(0, revealedHints).map((hint, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800"
                  >
                    <strong className="text-xs">Hint {i + 1}:</strong> {hint}
                  </div>
                ))}
                {revealedHints < exercise.hints.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRevealedHints((r) => Math.min(r + 1, exercise.hints.length))}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Reveal Hint {revealedHints + 1}
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {submitResult && (
            <Card className={`border-2 ${submitResult.correct ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {submitResult.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`font-semibold text-sm ${submitResult.correct ? "text-green-800" : "text-red-800"}`}>
                    {submitResult.correct ? "Correct!" : "Needs improvement"}
                  </span>
                  <span className="ml-auto text-xs font-mono tabular-nums text-muted-foreground">
                    Score: {submitResult.score}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{submitResult.feedback}</p>
              </CardContent>
            </Card>
          )}

          {existingProgress?.completed && !submitResult && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              You previously completed this exercise (score: {existingProgress.score}/100)
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Code Editor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetCode}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <button
              onClick={() => setShowDescription(true)}
              className="lg:hidden text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted"
            >
              Problem
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
              padding: { top: 12 },
              tabSize: 4,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="border-t border-border/50 bg-muted/30 px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runCode}
              disabled={isRunning}
              className="text-xs"
            >
              {isRunning ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">Running...</span>
                </span>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Run Code
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={submitCode}
              disabled={isSubmitting}
              className="text-xs bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:opacity-90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">Checking...</span>
                </span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>

        {showOutput && (
          <div className="border-t border-border/50 shrink-0">
            <div className="flex items-center justify-between px-4 py-1.5 bg-black/90">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-green-400" />
                <span className="text-[11px] font-mono text-green-400">Output</span>
              </div>
              <button
                onClick={() => setShowOutput(false)}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="h-3 w-3" />
              </button>
            </div>
            <pre className="bg-black/95 text-green-300 p-3 text-xs font-mono leading-relaxed overflow-auto max-h-40 whitespace-pre-wrap">
              {output || "> Waiting for output..."}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
