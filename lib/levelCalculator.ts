export type CodingLevel = "BEGINNER" | "MODERATE" | "ADVANCED";

export function calculateLevel(completedLessons: number): CodingLevel {
  if (completedLessons >= 16) return "ADVANCED";
  if (completedLessons >= 6) return "MODERATE";
  return "BEGINNER";
}

export function getLevelLabel(level: CodingLevel): string {
  switch (level) {
    case "BEGINNER": return "Beginner";
    case "MODERATE": return "Moderate";
    case "ADVANCED": return "Advanced";
  }
}
