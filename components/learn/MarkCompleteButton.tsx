"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
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
        router.refresh();
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
        "w-full transition-all",
        completed
          ? "bg-green-500 hover:bg-green-600 text-white cursor-default"
          : "bg-brand-primary hover:bg-brand-primary/90 text-white",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : completed ? (
        <Check className="h-4 w-4 mr-2" />
      ) : null}
      {completed ? "Completed" : "Mark as Complete"}
    </Button>
  );
}
