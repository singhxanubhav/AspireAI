import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel, getLevelLabel } from "@/lib/levelCalculator";
import { GoogleGenAI } from "@google/genai";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import Link from "next/link";
import {
  BookOpen, Code2, GraduationCap, Zap, Sparkles, CheckCircle2,
  BrainCircuit, Calendar, Bot, Trophy, Target,
  Flame, ChevronRight, Medal, Star, Layers,
} from "lucide-react";

const levelConfig: Record<string, { icon: string; label: string; badge: string; bar: string }> = {
  BEGINNER: { icon: "🌱", label: "Beginner", badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20", bar: "from-emerald-400 to-green-500" },
  MODERATE: { icon: "⚡", label: "Moderate", badge: "bg-amber-500/15 text-amber-500 border-amber-500/20", bar: "from-amber-400 to-orange-500" },
  ADVANCED: { icon: "🔥", label: "Advanced", badge: "bg-red-500/15 text-red-500 border-red-500/20", bar: "from-red-400 to-rose-500" },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function calculateStreak(lessonDates: Date[], exerciseDates: Date[]): number {
  const allDates = [
    ...lessonDates.map((d) => d.toISOString().split("T")[0]),
    ...exerciseDates.filter((d) => d).map((d) => d.toISOString().split("T")[0]),
  ];
  const unique = [...new Set(allDates)].sort().reverse();
  if (unique.length === 0) return 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const diff = (new Date(unique[i - 1]).getTime() - new Date(unique[i]).getTime()) / 86400000;
    if (diff === 1) streak++; else break;
  }
  return streak;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return <div className="p-8 text-center">Please log in to view your profile.</div>;

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, codingLevel: true, createdAt: true },
  });
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  const completedLessons = await prisma.userProgress.findMany({
    where: { userId, completed: true },
    select: { completedAt: true, lesson: { select: { title: true, course: { select: { title: true, slug: true } } } } },
    orderBy: { completedAt: "desc" },
  });

  const completedExercises = await prisma.exerciseProgress.findMany({
    where: { userId, completed: true },
    select: { completedAt: true, score: true, exercise: { select: { title: true, lesson: { select: { course: { select: { title: true, slug: true } } } } } } },
    orderBy: { completedAt: "desc" },
  });

  const allProgress = await prisma.userProgress.findMany({
    where: { userId },
    select: { lessonId: true, completed: true, lesson: { select: { courseId: true, course: { select: { title: true, slug: true } } } } },
  });

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } },
    orderBy: { order: "asc" },
  });

  const completedLessonCount = completedLessons.length;
  const solvedExerciseCount = completedExercises.length;
  const currentLevel = calculateLevel(completedLessonCount);
  const leveledUp = currentLevel !== user.codingLevel;
  const courseIdsStarted = new Set(allProgress.filter((p) => p.completed).map((p) => p.lesson.courseId));
  const inProgressCount = courseIdsStarted.size;
  const lessonDates = completedLessons.filter((l) => l.completedAt).map((l) => l.completedAt!);
  const exerciseDates = completedExercises.filter((e) => e.completedAt).map((e) => e.completedAt!);
  const streak = calculateStreak(lessonDates, exerciseDates);
  const completedLessonIds = new Set(allProgress.filter((p) => p.completed).map((p) => p.lessonId));
  const totalExercises = await prisma.exercise.count();
  const totalLessons = courses.reduce((a, c) => a + c.lessons.length, 0);
  const lessonRate = totalLessons > 0 ? Math.round((completedLessonCount / totalLessons) * 100) : 0;
  const completionRate = totalExercises > 0 ? Math.round((solvedExerciseCount / totalExercises) * 100) : 0;

  let recommendation = "";
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Astra, a friendly AI coding buddy for students. 
User stats: completed ${completedLessonCount} lessons, solved ${solvedExerciseCount} exercises, current level: ${getLevelLabel(currentLevel)}, courses in progress: ${inProgressCount}.
Based on this learning data, suggest in 2-3 sentences what this student should focus on next. Be encouraging and specific. Keep it simple for a school student. Use Hindi or Hinglish if natural. Never use markdown.`;
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      recommendation = result.text || "Keep going with your current pace! Try the next lesson or practice an exercise.";
    }
  } catch {
    recommendation = "Keep up the great work! Try completing the next lesson to continue your progress.";
  }

  const activityFeed: { date: Date; text: string; type: "lesson" | "exercise" }[] = [
    ...completedLessons.map((l) => ({ date: l.completedAt!, text: `Completed: ${l.lesson.title} — ${l.lesson.course.title}`, type: "lesson" as const })),
    ...completedExercises.map((e) => ({ date: e.completedAt!, text: `Solved: ${e.exercise.title} (Score: ${e.score}/100)`, type: "exercise" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  const lc = levelConfig[currentLevel] || levelConfig.BEGINNER;
  const nextLevelTarget = currentLevel === "BEGINNER" ? 6 : currentLevel === "MODERATE" ? 16 : null;
  const nextLevelProgress = nextLevelTarget ? Math.min(100, Math.round((completedLessonCount / nextLevelTarget) * 100)) : 100;

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white dark:from-[#0F0D1A] dark:to-[#0A0815]">
      {leveledUp && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-4 shadow-2xl shadow-amber-500/30 flex items-center gap-3 ring-1 ring-white/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Congratulations! You leveled up!</p>
              <p className="text-xs text-white/80">You&apos;re now <strong>{getLevelLabel(currentLevel)}</strong> — keep going!</p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="h-52 sm:h-60 bg-gradient-to-br from-[#1A1A2E] via-[#2D2850] to-[#4F3D8A] overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-28 relative z-10 pb-12">
        <div className="flex items-center mb-10">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Avatar size="lg" className="size-16 sm:size-20 shadow-xl shrink-0">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name ?? ""} />
                ) : (
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-brand-primary to-brand-accent text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                  {user.name || "Student"}
                </h1>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border backdrop-blur-sm shadow-sm ${lc.badge}`}>
                  <span className="text-sm">{lc.icon}</span>
                  {lc.label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-x-5 gap-y-2 w-full sm:w-auto">
              <p className="text-sm text-white/70">{user.email}</p>
              <span className="text-xs text-white/60 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm ring-1 ring-white/10">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(user.createdAt)}
              </span>
              <EditProfileDialog currentName={user.name} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <BookOpen className="h-4 w-4" />, label: "Lessons", value: completedLessonCount, color: "from-violet-500 to-indigo-500", shadow: "shadow-violet-500/15" },
            { icon: <Code2 className="h-4 w-4" />, label: "Solved", value: solvedExerciseCount, color: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/15" },
            { icon: <GraduationCap className="h-4 w-4" />, label: "Courses", value: inProgressCount, color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/15" },
            { icon: <Flame className="h-4 w-4" />, label: "Streak", value: `${streak}d`, full: `${streak} day${streak !== 1 ? "s" : ""}`, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/15" },
          ].map((stat) => (
            <Card key={stat.label} className="group relative border-0 bg-white dark:bg-white/5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-[0.02] group-hover:opacity-[0.04] transition-opacity`} />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">{stat.label}</span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm ${stat.shadow} ring-1 ring-white/20`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="font-heading text-3xl font-bold text-foreground tabular-nums tracking-tight">
                  {stat.value}
                </p>
                {stat.full && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.full}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            <Card className="border-0 bg-white dark:bg-white/5 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3 bg-muted/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-sm">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <h2 className="font-heading text-sm font-semibold text-foreground">Course Progress</h2>
              </div>
              <div className="divide-y divide-border/30">
                {courses.map((course) => {
                  const done = allProgress.filter((p) => p.lesson.courseId === course.id && p.completed).length;
                  const total = course.lessons.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  if (done === 0) return null;
                  const nextLesson = course.lessons.find((l) => !completedLessonIds.has(l.id));
                  return (
                    <div key={course.id} className="px-6 py-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 text-brand-primary ring-1 ring-brand-primary/10">
                            {course.language === "PYTHON" ? <Code2 className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                          </span>
                          <div>
                            <span className="text-sm font-semibold text-foreground">{course.title}</span>
                            <p className="text-[11px] text-muted-foreground">{done}/{total} lessons</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold tabular-nums text-foreground/70">{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-3">
                        {nextLesson ? (
                          <Link href={`/learn/${course.slug}/${nextLesson.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors group/link">
                            Continue <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {courses.every((c) => allProgress.filter((p) => p.lesson.courseId === c.id && p.completed).length === 0) && (
                  <div className="px-6 py-12 text-center">
                    <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No courses started yet</p>
                    <Link href="/learn" className="text-xs text-brand-primary font-medium hover:underline mt-2 inline-block">Browse courses →</Link>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-0 bg-white dark:bg-white/5 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3 bg-muted/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
                  <Zap className="h-3.5 w-3.5" />
                </span>
                <h2 className="font-heading text-sm font-semibold text-foreground">Recent Activity</h2>
              </div>
              {activityFeed.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Zap className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No activity yet — start learning!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {activityFeed.map((item, i) => (
                    <div key={i} className="px-6 py-3.5 flex items-center gap-3.5 hover:bg-muted/20 transition-colors group">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110 ${
                        item.type === "lesson" ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" : "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400"
                      }`}>
                        {item.type === "lesson" ? <CheckCircle2 className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/90 truncate font-medium">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {recommendation && (
              <Card className="border-0 shadow-lg overflow-hidden relative bg-gradient-to-br from-brand-primary/[0.02] via-white to-brand-accent/[0.02] dark:from-brand-primary/[0.04] dark:via-white/5 dark:to-brand-accent/[0.04]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/20 ring-1 ring-white/20">
                      <Bot className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                        Astra AI
                      </p>
                      <p className="text-[11px] text-muted-foreground">Personalized recommendation</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-2 top-0 text-4xl text-brand-primary/10 font-serif leading-none select-none">&ldquo;</div>
                    <p className="text-sm text-foreground/80 leading-relaxed pl-3 relative z-10">
                      {recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 bg-white dark:bg-white/5 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3 bg-muted/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                  <Medal className="h-3.5 w-3.5" />
                </span>
                <h2 className="font-heading text-sm font-semibold text-foreground">Achievements</h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                      Lessons
                    </span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{completedLessonCount}/{totalLessons}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/30">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 ease-out shadow-sm" style={{ width: `${lessonRate}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-pink-500" />
                      Exercises
                    </span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{solvedExerciseCount}/{totalExercises}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/30">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000 ease-out shadow-sm" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      Level — {lc.label}
                    </span>
                    <span className="text-xs font-bold tabular-nums text-foreground">{lc.icon}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70 ring-1 ring-inset ring-border/30">
                    <div className={`h-full rounded-full bg-gradient-to-r ${lc.bar} transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${nextLevelProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {nextLevelTarget ? (
                      <><strong className="text-foreground">{Math.max(0, nextLevelTarget - completedLessonCount)}</strong> more {nextLevelTarget - completedLessonCount === 1 ? "lesson" : "lessons"} to reach {currentLevel === "BEGINNER" ? "Moderate" : "Advanced"}</>
                    ) : (
                      "Maximum level reached! 🎉"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
