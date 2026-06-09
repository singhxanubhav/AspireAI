"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  isCompleted: boolean;
};

export default function LessonListSidebar({
  courseSlug,
  lessons,
  currentLessonId,
}: {
  courseSlug: string;
  lessons: Lesson[];
  currentLessonId: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-1">
      {lessons.map((lesson) => {
        const isActive = lesson.id === currentLessonId;
        return (
          <button
            key={lesson.id}
            onClick={() => router.push(`/learn/${courseSlug}/${lesson.id}`)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              isActive
                ? "bg-brand-primary/10 text-brand-primary font-medium"
                : "text-muted-foreground hover:bg-brand-light hover:text-foreground",
            )}
          >
            {lesson.isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            ) : isActive ? (
              <PlayCircle className="h-4 w-4 text-brand-primary shrink-0" />
            ) : (
              <Circle className="h-4 w-4 shrink-0" />
            )}
            <span className="flex-1 truncate">{lesson.title}</span>
            {lesson.duration && (
              <span className="text-xs text-muted-foreground shrink-0">
                {Math.floor(lesson.duration / 60)}m
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
