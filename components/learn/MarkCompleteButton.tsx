"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
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

  async function handleClick() {
    if (completed || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        setCompleted(true);
        setTimeout(() => router.refresh(), 600);
      }
    } catch {
      console.error("Failed to mark lesson complete");
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
