import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel, getLevelLabel } from "@/lib/levelCalculator";
import { GoogleGenAI } from "@google/genai";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your AvenzaAI learning dashboard — track progress, streaks, and activity.",
};
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import Link from "next/link";
import {
  BookOpen, Code2, GraduationCap, Zap, Sparkles, CheckCircle2,
  BrainCircuit, Calendar, Bot, Trophy, Target,
  Flame, ChevronRight, Medal, Star, Layers, ArrowUpRight,
} from "lucide-react";

const levelConfig: Record<string, { icon: string; label: string; badge: string; bar: string }> = {
  BEGINNER: { icon: "🌱", label: "Beginner", badge: "bg-emerald-500/15 text-emerald-500", bar: "from-emerald-400 to-green-500" },
  MODERATE: { icon: "⚡", label: "Moderate", badge: "bg-amber-500/15 text-amber-500", bar: "from-amber-400 to-orange-500" },
  ADVANCED: { icon: "🔥", label: "Advanced", badge: "bg-red-500/15 text-red-500", bar: "from-red-400 to-rose-500" },
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
  const streak = calculateStreak(
    completedLessons.filter((l) => l.completedAt).map((l) => l.completedAt!),
    completedExercises.filter((e) => e.completedAt).map((e) => e.completedAt!),
  );
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
Based on this learning data, suggest in 1 short sentence what this student should focus on next. Be encouraging. Keep it under 120 chars.`;
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      recommendation = result.text || "Keep going — try the next lesson!";
    }
  } catch {
    recommendation = "Keep going — try the next lesson!";
  }

  const activityFeed: { date: Date; text: string; type: "lesson" | "exercise" }[] = [
    ...completedLessons.map((l) => ({ date: l.completedAt!, text: l.lesson.title, type: "lesson" as const })),
    ...completedExercises.map((e) => ({ date: e.completedAt!, text: `${e.exercise.title} (${e.score}/100)`, type: "exercise" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const lc = levelConfig[currentLevel] || levelConfig.BEGINNER;
  const nextLevelTarget = currentLevel === "BEGINNER" ? 6 : currentLevel === "MODERATE" ? 16 : null;
  const nextLevelProgress = nextLevelTarget ? Math.min(100, Math.round((completedLessonCount / nextLevelTarget) * 100)) : 100;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black">
      {leveledUp && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in">
          <div className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-3 shadow-2xl shadow-amber-500/30 flex items-center gap-3 text-sm font-semibold">
            <Trophy className="h-4 w-4" />
            Leveled up — you&apos;re now {getLevelLabel(currentLevel)}!
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar size="sm" className="size-12 sm:size-14 shadow-md ring-2 ring-white dark:ring-gray-900">
              {user.image ? <AvatarImage src={user.image} alt={user.name ?? ""} /> : (
                <AvatarFallback className="text-base font-bold bg-gradient-to-br from-brand-primary to-brand-accent text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">{user.name || "Student"}</h1>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${lc.badge}`}>
                  <span className="text-sm">{lc.icon}</span>
                  {lc.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{user.email}</span>
                <span className="text-border/50">·</span>
                <span>Joined {formatDate(user.createdAt)}</span>
              </p>
            </div>
          </div>
          <EditProfileDialog currentName={user.name} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen className="h-4 w-4" />, label: "Lessons", value: completedLessonCount, color: "from-violet-500 to-indigo-500" },
            { icon: <Code2 className="h-4 w-4" />, label: "Solved", value: solvedExerciseCount, color: "from-pink-500 to-rose-500" },
            { icon: <GraduationCap className="h-4 w-4" />, label: "Courses", value: inProgressCount, color: "from-emerald-500 to-teal-500" },
            { icon: <Flame className="h-4 w-4" />, label: "Streak", value: `${streak}d`, color: "from-amber-500 to-orange-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 bg-white dark:bg-white/[0.03] shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                  {stat.icon}
                </span>
                <div>
                  <p className="text-xl font-bold text-foreground tabular-nums leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-5">
            <Card className="border-0 bg-white dark:bg-white/[0.03] shadow-sm">
              <div className="px-5 py-3.5 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent text-white">
                    <Layers className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Courses</h2>
                </div>
              </div>
              <div className="divide-y divide-border/20">
                {courses.map((course) => {
                  const done = allProgress.filter((p) => p.lesson.courseId === course.id && p.completed).length;
                  const total = course.lessons.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  if (done === 0) return null;
                  const nextLesson = course.lessons.find((l) => !completedLessonIds.has(l.id));
                  return (
                    <div key={course.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                        {course.language === "PYTHON" ? <Code2 className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground truncate">{course.title}</span>
                          <span className="text-xs tabular-nums text-muted-foreground ml-2 shrink-0">{done}/{total}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70 mt-1.5">
                          <div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {nextLesson && (
                        <Link href={`/learn/${course.slug}/${nextLesson.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 transition-colors shrink-0">
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  );
                })}
                {courses.every((c) => allProgress.filter((p) => p.lesson.courseId === c.id && p.completed).length === 0) && (
                  <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No courses started yet — <Link href="/learn" className="text-brand-primary font-medium hover:underline">browse courses</Link>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-5">
              <Card className="border-0 bg-white dark:bg-white/[0.03] shadow-sm">
                <div className="px-5 py-3.5 border-b border-border/30 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <Zap className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Activity</h2>
                </div>
                {activityFeed.length === 0 ? (
                  <div className="px-5 py-8 text-center text-xs text-muted-foreground">No activity yet</div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {activityFeed.slice(0, 4).map((item, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                          item.type === "lesson" ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15" : "bg-pink-100 text-pink-600 dark:bg-pink-500/15"
                        }`}>
                          {item.type === "lesson" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/80 truncate font-medium">{item.text}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="border-0 bg-white dark:bg-white/[0.03] shadow-sm">
                <div className="px-5 py-3.5 border-b border-border/30 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <Medal className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Progress</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-semibold text-foreground tabular-nums">{completedLessonCount}/{totalLessons}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/70 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${lessonRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Exercises</span>
                      <span className="font-semibold text-foreground tabular-nums">{solvedExerciseCount}/{totalExercises}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/70 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground flex items-center gap-1">{lc.icon} {lc.label}</span>
                      <span className="font-semibold text-foreground tabular-nums">{nextLevelTarget ? `${completedLessonCount}/${nextLevelTarget}` : "MAX"}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/70 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${lc.bar} transition-all`} style={{ width: `${nextLevelProgress}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-5">
            <Card className="border-0 shadow-sm overflow-hidden relative bg-gradient-to-br from-brand-primary/[0.03] via-white to-brand-accent/[0.03] dark:from-brand-primary/[0.05] dark:via-white/[0.02] dark:to-brand-accent/[0.05]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-brand-accent/10 via-transparent to-transparent" />
              <CardContent className="p-5 relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent text-white shadow-md">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                      Astra
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  &ldquo;{recommendation}&rdquo;
                </p>
                <div className="mt-4 flex gap-2.5">
                  <Link href="/practice" className="flex-1 text-center rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-semibold py-2.5 hover:bg-brand-primary/20 transition-colors">
                    Practice
                  </Link>
                  <Link href="/learn" className="flex-1 text-center rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-semibold py-2.5 hover:bg-brand-primary/20 transition-colors">
                    Learn
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white dark:bg-white/[0.03] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                    <Target className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick Actions</h2>
                </div>
                <div className="space-y-2">
                  {courses.map((course) => {
                    const done = allProgress.filter((p) => p.lesson.courseId === course.id && p.completed).length;
                    const nextLesson = done > 0 ? course.lessons.find((l) => !completedLessonIds.has(l.id)) : course.lessons[0];
                    if (!nextLesson) return null;
                    return (
                      <Link key={course.id} href={`/learn/${course.slug}/${nextLesson.id}`} className="flex items-center justify-between rounded-lg px-4 py-2.5 hover:bg-brand-primary/5 transition-colors group">
                        <span className="text-sm font-medium text-foreground truncate">{course.title}</span>
                        <span className="text-xs text-brand-primary font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {done > 0 ? "Continue" : "Start"} <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    );
                  })}
                  {courses.every((c) => allProgress.filter((p) => p.lesson.courseId === c.id && p.completed).length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-4">No courses available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
