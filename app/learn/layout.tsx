import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CourseSidebar from "@/components/learn/CourseSidebar";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      },
    },
    orderBy: { order: "asc" },
  });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { lessonId: true, completed: true },
  });

  const completionMap: Record<string, number> = {};
  for (const course of courses) {
    const total = course._count.lessons;
    const done = progress.filter(
      (p) => p.completed && course.lessons.some((l) => l.id === p.lessonId),
    ).length;
    completionMap[course.id] = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <CourseSidebar
        courses={courses}
        progress={progress}
        completionMap={completionMap}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
