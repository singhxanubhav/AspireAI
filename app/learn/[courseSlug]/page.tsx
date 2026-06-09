import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProgressBar from "@/components/learn/ProgressBar";
import LessonCard from "@/components/learn/LessonCard";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Clock } from "lucide-react";

function formatLanguage(lang: string) {
  switch (lang) {
    case "PYTHON":
      return "Python";
    case "AI_BASICS":
      return "AI Basics";
    case "JAVASCRIPT":
      return "JavaScript";
    default:
      return lang;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!course || !course.isPublished) {
    notFound();
  }

  const progress = session?.user?.id
    ? await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: { courseId: course.id },
        },
        select: { lessonId: true, completed: true },
      })
    : [];

  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId),
  );
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const pct =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const firstIncomplete = course.lessons.find(
    (l) => !completedIds.has(l.id),
  );

  const totalDuration = course.lessons.reduce(
    (sum, l) => sum + (l.duration || 0),
    0,
  );
  const allCompleted = totalLessons > 0 && completedLessons === totalLessons;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Courses
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs font-medium"
          >
            {formatLanguage(course.language)}
          </Badge>
          {allCompleted && (
            <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 border-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {course.title}
          </h1>
          <p className="text-muted-foreground mt-2 leading-relaxed max-w-2xl">
            {course.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>
              {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
            </span>
          </div>
          {totalDuration > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(totalDuration)} total</span>
            </div>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-r from-brand-primary/[0.04] to-brand-accent/[0.04]">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-heading font-semibold text-foreground text-sm">
              Your Progress
            </span>
            <span className="text-sm font-medium tabular-nums text-brand-primary">
              {completedLessons}/{totalLessons} complete
            </span>
          </div>
          <ProgressBar value={pct} className="h-3" />
          {allCompleted && (
            <p className="text-sm text-green-600 font-medium mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Congratulations! You&apos;ve completed all lessons in this course.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Lessons
          </h2>
          <span className="text-xs text-muted-foreground">
            {completedLessons} of {totalLessons} completed
          </span>
        </div>

        <div className="space-y-3">
          {course.lessons.length === 0 ? (
            <Card className="border-dashed border-muted-foreground/20">
              <CardContent className="p-10 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No lessons in this course yet
                </p>
              </CardContent>
            </Card>
          ) : (
            course.lessons.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id);
              const isInProgress =
                !isCompleted && lesson.id === firstIncomplete?.id;

              return (
                <LessonCard
                  key={lesson.id}
                  courseSlug={courseSlug}
                  lesson={lesson}
                  status={
                    isCompleted
                      ? "completed"
                      : isInProgress
                        ? "in-progress"
                        : "in-progress"
                  }
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
