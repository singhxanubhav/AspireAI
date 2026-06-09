import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import VideoPlayer from "@/components/learn/VideoPlayer";
import MarkCompleteButton from "@/components/learn/MarkCompleteButton";
import LessonListSidebar from "@/components/learn/LessonListSidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const session = await auth();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { course: true },
  });

  if (!lesson || lesson.course.slug !== courseSlug) {
    notFound();
  }

  const courseLessons = await prisma.lesson.findMany({
    where: { courseId: lesson.courseId },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true, duration: true },
  });

  const userProgress = session?.user?.id
    ? await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: { courseId: lesson.courseId },
        },
        select: { lessonId: true, completed: true },
      })
    : [];

  const completedIds = new Set(
    userProgress.filter((p) => p.completed).map((p) => p.lessonId),
  );
  const isCompleted = completedIds.has(lessonId);

  const lessonsWithStatus = courseLessons.map((l) => ({
    ...l,
    isCompleted: completedIds.has(l.id),
  }));

  const currentIndex = courseLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < courseLessons.length - 1
      ? courseLessons[currentIndex + 1]
      : null;

  const totalCourseLessons = courseLessons.length;
  const completedInCourse = courseLessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const isLastLesson = !nextLesson;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/learn/${courseSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-4"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to {lesson.course.title}
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/learn"
            className="hover:text-foreground transition-colors"
          >
            Courses
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/learn/${courseSlug}`}
            className="hover:text-foreground transition-colors"
          >
            {lesson.course.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {lesson.title}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="secondary"
                className="rounded-full text-xs font-medium"
              >
                Lesson {lesson.order} of {totalCourseLessons}
              </Badge>
              {lesson.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(lesson.duration)}
                </span>
              )}
              {isCompleted && (
                <Badge className="rounded-full text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 border-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {lesson.title}
              </h1>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden shadow-xl shadow-black/5 ring-1 ring-black/5">
            <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
          </div>

          <Card className="border-border/50">
            <CardContent className="p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-primary" />
                About this lesson
              </h2>
              <div className="prose prose-sm prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-code:text-brand-primary prose-code:bg-brand-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {lesson.description}
                </Markdown>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Practice makes perfect. Complete the practice questions to
              reinforce what you&apos;ve learned.
            </span>
          </div>

          <div className="lg:hidden space-y-4">
            <Separator />
            <div className="space-y-3">
              <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-primary" />
                Lessons in this course
              </h3>
              <LessonListSidebar
                courseSlug={courseSlug}
                lessons={lessonsWithStatus}
                currentLessonId={lessonId}
              />
            </div>
            <Separator />
            <MarkCompleteButton
              lessonId={lessonId}
              isCompleted={isCompleted}
            />
            <a
              href={`/practice/${courseSlug}/${lessonId}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-brand-light to-brand-accent/5 py-3 text-sm font-medium text-brand-primary hover:from-brand-primary/10 hover:to-brand-accent/10 transition-all border border-brand-primary/10"
            >
              <Sparkles className="h-4 w-4" />
              Go to Practice Questions
            </a>
            <Separator />
          </div>

          <div className="flex items-center justify-between gap-3">
            {prevLesson ? (
              <Link
                href={`/learn/${courseSlug}/${prevLesson.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all group"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Previous</span>
                <span className="truncate max-w-[120px] hidden sm:inline text-xs">
                  {prevLesson.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${courseSlug}/${nextLesson.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-primary/90 transition-all group shadow-lg shadow-brand-primary/20"
              >
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {nextLesson.title}
                </span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-5 py-2.5 text-sm font-medium text-green-700 border border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                Course complete!
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:gap-5">
          <div className="rounded-xl bg-gradient-to-b from-brand-primary/[0.03] to-brand-accent/[0.03] p-4 space-y-2 border border-brand-primary/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Course progress
              </span>
              <span className="font-semibold text-brand-primary tabular-nums">
                {completedInCourse}/{totalCourseLessons}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-500"
                style={{
                  width: `${totalCourseLessons > 0 ? (completedInCourse / totalCourseLessons) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-primary" />
              Lessons
            </h3>
            <LessonListSidebar
              courseSlug={courseSlug}
              lessons={lessonsWithStatus}
              currentLessonId={lessonId}
            />
          </div>

          <Separator />

          <MarkCompleteButton
            lessonId={lessonId}
            isCompleted={isCompleted}
          />

          <a
            href={`/practice/${courseSlug}/${lessonId}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-brand-light to-brand-accent/5 py-3 text-sm font-medium text-brand-primary hover:from-brand-primary/10 hover:to-brand-accent/10 transition-all border border-brand-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Practice Questions
          </a>

          {isLastLesson && isCompleted && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-heading font-semibold text-green-800 text-sm">
                  Course Complete!
                </p>
                <p className="text-xs text-green-600">
                  You&apos;ve finished all lessons. Great work!
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
