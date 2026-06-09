import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PracticeExerciseClient } from "./PracticeExerciseClient";
import { Badge } from "@/components/ui/badge";

const difficultyColor: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD: "bg-red-100 text-red-700 border-red-200",
};

export default async function PracticeExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const session = await auth();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      lesson: {
        select: { id: true, title: true, course: { select: { title: true, slug: true } } },
      },
    },
  });

  if (!exercise) notFound();

  const existingProgress = session?.user?.id
    ? await prisma.exerciseProgress.findUnique({
        where: {
          userId_exerciseId: {
            userId: session.user.id,
            exerciseId,
          },
        },
      })
    : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border/50 bg-white/95 backdrop-blur-sm shrink-0">
        <a
          href="/practice"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Practice
        </a>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-sm font-medium text-foreground truncate">
          {exercise.title}
        </h1>
        <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${difficultyColor[exercise.difficulty] || ""}`}>
          {exercise.difficulty}
        </Badge>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <PracticeExerciseClient
          exercise={{
            id: exercise.id,
            title: exercise.title,
            description: exercise.description,
            starterCode: exercise.starterCode || "",
            hints: exercise.hints,
            difficulty: exercise.difficulty,
            lessonTitle: exercise.lesson.title,
            courseTitle: exercise.lesson.course.title,
            courseSlug: exercise.lesson.course.slug,
          }}
          existingProgress={existingProgress ? { completed: existingProgress.completed, score: existingProgress.score, code: existingProgress.code } : null}
        />
      </div>
    </div>
  );
}
