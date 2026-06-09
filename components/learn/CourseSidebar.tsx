"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronDown,
  CheckCircle,
  Circle,
  BookOpen,
  Code2,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";

type CourseLesson = {
  id: string;
  title: string;
  order: number;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  language: string;
  lessons: CourseLesson[];
  _count: { lessons: number };
};

type ProgressItem = {
  lessonId: string;
  completed: boolean;
};

function CourseIcon({ language }: { language: string }) {
  switch (language) {
    case "PYTHON":
      return <Code2 className="h-4 w-4" />;
    case "AI_BASICS":
      return <BrainCircuit className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

export default function CourseSidebar({
  courses,
  progress,
  completionMap,
}: {
  courses: Course[];
  progress: ProgressItem[];
  completionMap: Record<string, number>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const activeSlug = pathname.match(/\/learn\/([^/]+)/)?.[1] || null;
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId),
  );

  const sidebarContent = (
    <div className="space-y-1">
      <div className="px-3 pt-1 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent shadow-sm">
            <Lightbulb className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold font-heading text-brand-primary">
            Aspire<span className="text-brand-accent">AI</span>
          </span>
        </Link>
      </div>
      <div className="px-3 pb-2">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Courses
        </h2>
      </div>
      {courses.map((course) => {
        const isActive = activeSlug === course.slug;
        const isExpanded = expanded[course.id] ?? isActive;
        const completion = completionMap[course.id] || 0;

        return (
          <div key={course.id}>
            <button
              onClick={() => {
                setExpanded((prev) => ({
                  ...prev,
                  [course.id]: !isExpanded,
                }));
                router.push(`/learn/${course.slug}`);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
                isActive
                  ? "bg-brand-primary/[0.06] text-brand-primary font-medium shadow-[inset_3px_0_0_0_#4F3D8A]"
                  : "text-muted-foreground hover:bg-brand-light hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CourseIcon language={course.language} />
              </span>
              <span className="flex-1 truncate text-sm font-medium leading-tight">
                {course.title}
              </span>
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                  completion === 100
                    ? "bg-green-100 text-green-700"
                    : completion > 0
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {completion}%
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "ml-4 overflow-hidden transition-all duration-200 ease-in-out",
                isExpanded ? "mt-1 max-h-96" : "max-h-0",
              )}
            >
              <div className="space-y-0.5 border-l border-border pl-2">
                {course.lessons.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground italic">
                    No lessons yet
                  </p>
                )}
                {course.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson.id);
                  const isCurrentLesson =
                    pathname === `/learn/${course.slug}/${lesson.id}`;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() =>
                        router.push(`/learn/${course.slug}/${lesson.id}`)
                      }
                      className={cn(
                        "w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all duration-150",
                        isCurrentLesson
                          ? "bg-brand-primary/[0.06] text-brand-primary font-medium shadow-[inset_2px_0_0_0_#4F3D8A]"
                          : "text-muted-foreground hover:bg-brand-light hover:text-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            isCurrentLesson
                              ? "bg-brand-primary/10"
                              : "bg-muted",
                          )}
                        >
                          <Circle
                            className={cn(
                              "h-2.5 w-2.5",
                              isCurrentLesson
                                ? "text-brand-primary"
                                : "text-muted-foreground/40",
                            )}
                          />
                        </span>
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-brand-card md:sticky md:top-0 md:self-start md:h-screen md:max-h-screen">
        <div className="flex-1 overflow-y-auto p-3">{sidebarContent}</div>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-3 top-20 z-40 md:hidden h-10 w-10 rounded-xl border-brand-primary/20 bg-white/80 backdrop-blur-md shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 pt-6 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <SheetTitle className="text-base font-bold font-heading text-brand-primary">
                Aspire<span className="text-brand-accent">AI</span>
              </SheetTitle>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto px-3 pb-6 pt-3">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
