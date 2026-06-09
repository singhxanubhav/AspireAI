import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/learn/ProgressBar";
import LessonCard from "@/components/learn/LessonCard";

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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          {formatLanguage(course.language)}
        </Badge>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {course.title}
        </h1>
        <p className="text-muted-foreground">{course.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Progress</span>
          <span className="text-muted-foreground">
            {completedLessons} of {totalLessons} lessons
          </span>
        </div>
        <ProgressBar value={pct} />
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Lessons
        </h2>
        <div className="space-y-3">
          {course.lessons.map((lesson) => {
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
          })}
        </div>
      </div>
    </div>
  );
}
