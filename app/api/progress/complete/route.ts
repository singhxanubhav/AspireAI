import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  return Response.json(progress);
}
