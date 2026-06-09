"use client";

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
import { Menu, ChevronDown, CheckCircle, Circle, BookOpen } from "lucide-react";

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
      <div className="px-3 py-2">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Your Courses
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
                "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-brand-primary/10 text-brand-primary font-medium"
                  : "text-muted-foreground hover:bg-brand-light hover:text-foreground",
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{course.title}</span>
              <span className="text-xs text-muted-foreground">
                {completion}%
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  isExpanded && "rotate-180",
                )}
              />
            </button>

            {isExpanded && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                {course.lessons.length === 0 && (
                  <p className="px-3 py-1.5 text-xs text-muted-foreground">
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
                        "w-full flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                        isCurrentLesson
                          ? "bg-brand-primary/10 text-brand-primary font-medium"
                          : "text-muted-foreground hover:bg-brand-light hover:text-foreground",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-3 w-3 shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-brand-card">
        <div className="flex-1 overflow-y-auto p-3">{sidebarContent}</div>
      </aside>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-3 top-20 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 pt-6 pb-2">
            <SheetTitle>Courses</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-3 pb-6">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
