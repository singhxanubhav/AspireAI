import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/levelCalculator";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await req.json();
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId,
      },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  const completedCount = await prisma.userProgress.count({
    where: { userId: session.user.id, completed: true },
  });

  const newLevel = calculateLevel(completedCount);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { codingLevel: true },
  });

  let leveledUp = false;
  if (user && user.codingLevel !== newLevel) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { codingLevel: newLevel },
    });
    leveledUp = true;
  }

  return Response.json({ ...progress, leveledUp, newLevel });
}
