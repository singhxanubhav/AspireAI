import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, ArrowRight, Zap } from "lucide-react";

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

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <Card className="bg-gradient-to-br from-brand-primary to-[#6B5CB8] text-white border-0">
        <CardContent className="p-6 space-y-3">
          <h1 className="font-heading text-2xl font-bold">
            Welcome back, {user?.name || "Coder"}!
          </h1>
          <p className="text-white/80">Ready to code today?</p>
          {userData?.codingLevel && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              {formatLevel(userData.codingLevel)}
            </Badge>
          )}
        </CardContent>
      </Card>

      {continueLesson && (
        <section>
          <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-accent" />
            Continue where you left off
          </h2>
          <Link
            href={`/learn/${continueLesson.course.slug}/${continueLesson.lesson.id}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-brand-light">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-brand-light p-3">
                  <BookOpen className="h-5 w-5 text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {continueLesson.course.title}
                  </p>
                  <p className="font-medium text-foreground truncate">
                    {continueLesson.lesson.title}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold mb-3">
            Recommended for you
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((item) => (
              <Link
                key={item.lesson.id}
                href={`/learn/${item.course.slug}/${item.lesson.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {item.course.title}
                    </p>
                    <p className="font-medium text-foreground">
                      {item.lesson.title}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-heading text-lg font-semibold mb-3">
          All Courses
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const completed = course.lessons.filter((l) =>
              completedLessonIds.has(l.id),
            ).length;
            const total = course.lessons.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link key={course.id} href={`/learn/${course.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-brand-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {formatLanguage(course.language)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {completed}/{total} done
                      </span>
                    </div>
                    <h3 className="font-heading font-medium text-foreground">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
