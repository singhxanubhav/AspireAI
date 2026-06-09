import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Zap,
  Rocket,
  Sparkles,
  GraduationCap,
  Code2,
  BrainCircuit,
} from "lucide-react";

function formatLevel(level: string) {
  switch (level) {
    case "BEGINNER":
      return "Beginner";
    case "MODERATE":
      return "Moderate";
    case "ADVANCED":
      return "Advanced";
    default:
      return level;
  }
}

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

function LanguageIcon({ language }: { language: string }) {
  switch (language) {
    case "PYTHON":
      return <Code2 className="h-4 w-4" />;
    case "AI_BASICS":
      return <BrainCircuit className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

export default async function LearnPage() {
  const session = await auth();
  const user = session?.user;

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true },
      },
    },
    orderBy: { order: "asc" },
  });

  const progress = user?.id
    ? await prisma.userProgress.findMany({
        where: { userId: user.id },
        select: { lessonId: true, completed: true },
      })
    : [];

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId),
  );

  const userData = user?.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { codingLevel: true },
      })
    : null;

  const allLessons = courses.flatMap((c) =>
    c.lessons.map((l) => ({
      course: { title: c.title, slug: c.slug },
      lesson: { id: l.id, title: l.title },
    })),
  );

  let continueLesson: (typeof allLessons)[number] | null = null;
  for (const item of allLessons) {
    if (!completedLessonIds.has(item.lesson.id)) {
      continueLesson = item;
      break;
    }
  }

  const recommended: typeof allLessons = [];
  if (continueLesson) {
    const idx = allLessons.findIndex(
      (l) => l.lesson.id === continueLesson.lesson.id,
    );
    recommended.push(...allLessons.slice(idx + 1, idx + 3));
  }

  const isFirstTime = completedLessonIds.size === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10 max-w-6xl mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#5B4AA8] to-[#7C5CFC] text-white border-0 shadow-2xl shadow-brand-primary/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <CardContent className="relative p-6 sm:p-8 lg:p-10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back, {user?.name || "Coder"}
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
                {isFirstTime
                  ? "Ready to start your coding journey? Pick a course below and take your first step."
                  : "Pick up where you left off or explore something new."}
              </p>
            </div>
            {userData?.codingLevel && (
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex shrink-0 bg-white/10 text-white border-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                {formatLevel(userData.codingLevel)}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <GraduationCap className="h-4 w-4" />
              <span>
                {completedLessonIds.size} lesson
                {completedLessonIds.size !== 1 ? "s" : ""} completed
              </span>
            </div>
            {courses.length > 0 && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <BookOpen className="h-4 w-4" />
                <span>
                  {courses.length} course{courses.length !== 1 ? "s" : ""}{" "}
                  available
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isFirstTime && courses.length > 0 && (
        <section>
          <Link
            href={`/learn/${courses[0].slug}/${courses[0].lessons[0]?.id}`}
          >
            <Card className="group relative overflow-hidden border-brand-primary/20 bg-gradient-to-r from-brand-primary/[0.03] to-brand-accent/[0.03] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-primary to-brand-accent" />
              <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/20">
                  <Rocket className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-foreground text-lg">
                    Getting Started
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    You haven&apos;t started any lessons yet. Begin with{" "}
                    <span className="font-medium text-brand-primary">
                      {courses[0].title}
                    </span>{" "}
                    and complete your first lesson. Your progress saves
                    automatically.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-brand-primary shrink-0 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {continueLesson && !isFirstTime && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent/10">
              <Zap className="h-4 w-4 text-brand-accent" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Continue where you left off
            </h2>
          </div>
          <Link
            href={`/learn/${continueLesson.course.slug}/${continueLesson.lesson.id}`}
          >
            <Card className="group relative overflow-hidden border-brand-light hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-y-0 left-0 w-1 bg-brand-accent" />
              <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent/20 to-brand-accent/5">
                  <BookOpen className="h-5 w-5 text-brand-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-brand-accent">
                    {continueLesson.course.title}
                  </p>
                  <p className="font-heading font-semibold text-foreground mt-0.5 truncate">
                    {continueLesson.lesson.title}
                  </p>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-brand-primary transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
              <Sparkles className="h-4 w-4 text-brand-primary" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Recommended for you
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((item) => (
              <Link
                key={item.lesson.id}
                href={`/learn/${item.course.slug}/${item.lesson.id}`}
              >
                <Card className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border-border/50 hover:border-brand-primary/20">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {item.course.title}
                    </p>
                    <p className="font-heading font-semibold text-foreground mt-1.5">
                      {item.lesson.title}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Start lesson</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </span>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              All Courses
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </span>
        </div>

        {courses.length === 0 ? (
          <Card className="border-dashed border-muted-foreground/20 bg-muted/30">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">
                No courses available yet
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Check back soon for new content
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const completed = course.lessons.filter((l) =>
                completedLessonIds.has(l.id),
              ).length;
              const total = course.lessons.length;
              const pct =
                total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <Link key={course.id} href={`/learn/${course.slug}`}>
                  <Card className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50 hover:border-brand-primary/20 h-full">
                    <CardContent className="p-5 space-y-4 flex flex-col h-full">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1.5 text-xs font-normal rounded-full px-3 py-1"
                        >
                          <LanguageIcon language={course.language} />
                          {formatLanguage(course.language)}
                        </Badge>
                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                          {completed}/{total}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Progress
                          </span>
                          <span className="text-[11px] font-semibold tabular-nums text-brand-primary">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
