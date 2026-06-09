import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Filter, Search, SlidersHorizontal } from "lucide-react";
import { PracticeFilters } from "./PracticeFilters";

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD: "bg-red-100 text-red-700 border-red-200",
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
  });

  const exercises = await prisma.exercise.findMany({
    include: {
      lesson: {
        select: { id: true, title: true, courseId: true, course: { select: { title: true, slug: true } } },
      },
      exerciseProgress: {
        where: { userId: session?.user?.id ?? "" },
        select: { completed: true, score: true },
      },
    },
    orderBy: { lesson: { order: "asc" } },
  });

  const completedSet = new Set(
    exercises.filter((e) => e.exerciseProgress[0]?.completed).map((e) => e.id),
  );

  const allLessons = await prisma.lesson.findMany({
    where: { course: { isPublished: true } },
    orderBy: { order: "asc" },
    select: { id: true, title: true, course: { select: { title: true } } },
  });

  const selectedCourses = params.courses?.split(",").filter(Boolean) ?? [];
  const selectedDifficulties = params.difficulties?.split(",").filter(Boolean) ?? [];
  const selectedLesson = params.lesson ?? "";
  const selectedStatus = params.status ?? "all";

  let filtered = exercises.filter((ex) => {
    if (selectedCourses.length > 0 && !selectedCourses.includes(ex.lesson.course.title)) return false;
    if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(ex.difficulty)) return false;
    if (selectedLesson && ex.lesson.id !== selectedLesson) return false;
    if (selectedStatus === "completed" && !completedSet.has(ex.id)) return false;
    if (selectedStatus === "pending" && completedSet.has(ex.id)) return false;
    return true;
  });

  const totalExercises = exercises.length;
  const completedExercises = completedSet.size;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Practice
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sharpen your skills with coding exercises
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span>{completedExercises}/{totalExercises} completed</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 shrink-0">
          <PracticeFilters
            courses={courses.map((c) => ({ title: c.title }))}
            lessons={allLessons}
            selectedCourses={selectedCourses}
            selectedDifficulties={selectedDifficulties}
            selectedLesson={selectedLesson}
            selectedStatus={selectedStatus}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Code2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No exercises match your filters</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your filter criteria</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((ex) => (
                <Link key={ex.id} href={`/practice/${ex.id}`}>
                  <Card className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-border/50 hover:border-brand-primary/20 h-full">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-primary to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm group-hover:text-brand-primary transition-colors">
                          {ex.title}
                        </CardTitle>
                        {completedSet.has(ex.id) && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {ex.lesson.title} &middot; {ex.lesson.course.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${difficultyColor[ex.difficulty] || ""}`}>
                        {ex.difficulty}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Solve Now
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
