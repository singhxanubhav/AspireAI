"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Filter, RotateCcw } from "lucide-react";
import { useCallback } from "react";

type Props = {
  courses: { title: string }[];
  lessons: { id: string; title: string; course: { title: string } }[];
  selectedCourses: string[];
  selectedDifficulties: string[];
  selectedLesson: string;
  selectedStatus: string;
};

const difficulties = [
  { value: "EASY", label: "Easy", color: "bg-green-400" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-400" },
  { value: "HARD", label: "Hard", color: "bg-red-400" },
];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
];

export function PracticeFilters({
  courses,
  lessons,
  selectedCourses,
  selectedDifficulties,
  selectedLesson,
  selectedStatus,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/practice?${params.toString()}`);
    },
    [router, searchParams],
  );

  const toggleArrayFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(key)?.split(",").filter(Boolean) ?? [];
      const idx = current.indexOf(value);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(value);
      }
      if (current.length > 0) {
        params.set(key, current.join(","));
      } else {
        params.delete(key);
      }
      router.push(`/practice?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("/practice");
  }, [router]);

  const hasFilters = selectedCourses.length > 0 || selectedDifficulties.length > 0 || !!selectedLesson || selectedStatus !== "all";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </h4>
        <div className="space-y-1.5">
          {statusOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="status"
                checked={selectedStatus === opt.value}
                onChange={() => updateFilter("status", opt.value === "all" ? "" : opt.value)}
                className="accent-brand-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Difficulty
        </h4>
        <div className="space-y-2">
          {difficulties.map((d) => (
            <label
              key={d.value}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedDifficulties.includes(d.value)}
                onCheckedChange={() => toggleArrayFilter("difficulties", d.value)}
              />
              <span className={`h-2 w-2 rounded-full ${d.color}`} />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course
        </h4>
        <div className="space-y-2">
          {courses.map((c) => (
            <label
              key={c.title}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedCourses.includes(c.title)}
                onCheckedChange={() => toggleArrayFilter("courses", c.title)}
              />
              {c.title}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lesson
        </h4>
        <Select
          value={selectedLesson}
          onValueChange={(v) => updateFilter("lesson", v === selectedLesson ? "" : v)}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="All lessons" />
          </SelectTrigger>
          <SelectContent>
            {lessons.map((l) => (
              <SelectItem key={l.id} value={l.id} className="text-xs">
                {l.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
