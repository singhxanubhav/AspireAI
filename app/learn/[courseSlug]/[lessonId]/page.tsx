import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import VideoPlayer from "@/components/learn/VideoPlayer";
import MarkCompleteButton from "@/components/learn/MarkCompleteButton";
import LessonListSidebar from "@/components/learn/LessonListSidebar";
import { Separator } from "@/components/ui/separator";

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
      <div className="flex-1 min-w-0 space-y-6">
        <VideoPlayer
          url={lesson.videoUrl}
          title={lesson.title}
        />

        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {lesson.title}
          </h1>
          <div className="prose prose-sm prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground max-w-none mt-4">
            <Markdown remarkPlugins={[remarkGfm]}>
              {lesson.description}
            </Markdown>
          </div>
        </div>

        <Separator className="lg:hidden" />

        <div className="space-y-3 lg:hidden">
          <h3 className="font-heading font-medium text-foreground">
            Lessons in this course
          </h3>
          <LessonListSidebar
            courseSlug={courseSlug}
            lessons={lessonsWithStatus}
            currentLessonId={lessonId}
          />
          <Separator />
          <MarkCompleteButton
            lessonId={lessonId}
            isCompleted={isCompleted}
          />
          <a
            href={`/practice/${courseSlug}/${lessonId}`}
            className="block w-full text-center rounded-lg bg-brand-light py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors"
          >
            Go to Practice Questions &rarr;
          </a>
        </div>
      </div>

      <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:gap-4">
        <div className="space-y-3">
          <h3 className="font-heading font-medium text-foreground">
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
          className="block w-full text-center rounded-lg bg-brand-light py-2.5 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors"
        >
          Go to Practice Questions &rarr;
        </a>
      </aside>
    </div>
  );
}
