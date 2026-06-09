import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, PlayCircle, Lock, Clock } from "lucide-react";

type Props = {
  courseSlug: string;
  lesson: {
    id: string;
    title: string;
    description: string;
    order: number;
    duration: number | null;
  };
  status: "completed" | "in-progress" | "locked";
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function LessonCard({ courseSlug, lesson, status }: Props) {
  const isLocked = status === "locked";

  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        status === "completed" && "border-green-200/60 bg-green-50/30",
        status === "in-progress" &&
          "border-brand-primary/30 bg-brand-primary/[0.02] shadow-[0_0_0_1px_rgba(79,61,138,0.1)]",
        !isLocked &&
          "hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-primary/20",
        isLocked && "opacity-50 grayscale-[30%]",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300",
          status === "completed" && "bg-green-500",
          status === "in-progress" && "bg-brand-primary",
          isLocked && "bg-muted-foreground/20",
        )}
      />

      <CardContent className="p-4 sm:p-5 flex items-start gap-4">
        <div
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            status === "completed" &&
              "bg-green-100 text-green-600 group-hover:bg-green-200",
            status === "in-progress" &&
              "bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary/15",
            isLocked && "bg-muted text-muted-foreground",
          )}
        >
          {status === "completed" ? (
            <CheckCircle className="h-5 w-5" />
          ) : status === "in-progress" ? (
            <PlayCircle className="h-5 w-5" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lesson {lesson.order}
            </span>
            {lesson.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(lesson.duration)}
              </span>
            )}
          </div>
          <h3
            className={cn(
              "mt-1.5 font-heading font-semibold leading-snug transition-colors",
              status === "completed" && "text-green-800",
              status === "in-progress" && "text-foreground",
              isLocked && "text-muted-foreground",
            )}
          >
            {lesson.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {!isLocked && (
          <div className="shrink-0 self-center text-muted-foreground/40 group-hover:text-brand-primary/60 transition-colors duration-300">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLocked) return content;

  return (
    <Link href={`/learn/${courseSlug}/${lesson.id}`} className="block">
      {content}
    </Link>
  );
}
