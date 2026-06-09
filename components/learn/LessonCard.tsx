import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, PlayCircle, Lock } from "lucide-react";

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

export default function LessonCard({ courseSlug, lesson, status }: Props) {
  const isLocked = status === "locked";

  const content = (
    <Card
      className={cn(
        "transition-all",
        status === "in-progress" &&
          "border-brand-primary/30 ring-1 ring-brand-primary/10",
        !isLocked && "hover:shadow-md cursor-pointer",
        isLocked && "opacity-60",
      )}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            status === "completed" && "bg-green-100 text-green-600",
            status === "in-progress" && "bg-brand-light text-brand-primary",
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              Lesson {lesson.order}
            </span>
            {lesson.duration && (
              <span className="text-xs text-muted-foreground">
                {Math.floor(lesson.duration / 60)} min
              </span>
            )}
          </div>
          <h3 className="font-medium text-foreground mt-0.5">
            {lesson.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {lesson.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLocked) return content;

  return (
    <Link href={`/learn/${courseSlug}/${lesson.id}`}>
      {content}
    </Link>
  );
}
