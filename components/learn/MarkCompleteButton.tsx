"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarkCompleteButton({
  lessonId,
  isCompleted: initialCompleted,
}: {
  lessonId: string;
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);
  const [levelUp, setLevelUp] = useState<string | null>(null);

  async function handleClick() {
    if (completed || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleted(true);
        if (data.leveledUp) {
          setLevelUp(data.newLevel);
          setTimeout(() => setLevelUp(null), 4000);
        }
        setTimeout(() => router.refresh(), 800);
      }
    } catch {
      console.error("Failed to mark lesson complete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {levelUp && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-4 fade-in duration-300">
          <div className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 shadow-2xl shadow-yellow-500/30 flex items-center gap-3">
            <Trophy className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">Level Up!</p>
              <p className="text-xs text-white/80">You reached {levelUp === "MODERATE" ? "Moderate" : levelUp === "ADVANCED" ? "Advanced" : "Beginner"}!</p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "w-full transition-all duration-300 rounded-xl py-6 text-base font-semibold",
          completed
            ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white cursor-default shadow-lg shadow-green-500/20"
            : "bg-gradient-to-r from-brand-primary to-[#6B5CB8] hover:from-brand-primary/90 hover:to-[#6B5CB8]/90 text-white shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98]",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Saving...
          </>
        ) : completed ? (
          <>
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 mr-2">
              <Check className="h-4 w-4" />
            </span>
            Completed
            <Sparkles className="h-4 w-4 ml-2 text-yellow-200" />
          </>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Mark as Complete
          </>
        )}
      </Button>
    </>
  );
}
