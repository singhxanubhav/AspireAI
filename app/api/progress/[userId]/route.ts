import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  const { userId } = await params;

  if (!session?.user?.id || session.user.id !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: { lesson: { include: { course: { select: { title: true, slug: true } } } } },
    orderBy: { lesson: { order: "asc" } },
  });

  return Response.json(progress);
}
