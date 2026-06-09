import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const languageColors: Record<string, string> = {
  PYTHON: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  AI_BASICS: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  JAVASCRIPT: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
};

const languageLabels: Record<string, string> = {
  PYTHON: "Python",
  AI_BASICS: "AI Basics",
  JAVASCRIPT: "JavaScript",
};

export default async function CoursesPreview() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    include: { _count: { select: { lessons: true } } },
    orderBy: { order: "asc" },
  });

  if (courses.length === 0) {
    return (
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-primary mb-4">
            Start with these courses
          </h2>
          <p className="text-gray-400">No courses available yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-brand-primary">
              Start with these courses
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Pick a course and start learning at your own pace.
            </p>
          </div>
          <Link
            href="/learn"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
          >
            View All Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/learn/${course.slug}`}
              className="group rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/5"
            >
              <div className="h-40 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 flex items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-brand-primary" />
                </div>
              </div>
              <div className="p-5">
                <Badge
                  className={`mb-3 ${
                    languageColors[course.language] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {languageLabels[course.language] || course.language}
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>
                    {course._count.lessons}{" "}
                    {course._count.lessons === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/learn">
            <Button variant="outline" className="w-full">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
