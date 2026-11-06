export type PriorityLevel = "High" | "Medium" | "Low";

export type PriorityFactor = {
  label: string;
  value: number;
  max: number;
  note: string;
};

export type Priority = {
  score: number;
  level: PriorityLevel;
  daysRemaining: number;
  factors: PriorityFactor[];
};

type ScoredTask = {
  deadline: string;
  estimatedHours: number;
  difficulty: string;
  importance: string;
  progress: number;
};

const DIFFICULTY_SCORE: Record<string, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 15,
};

const IMPORTANCE_SCORE: Record<string, number> = {
  Low: 7,
  Medium: 14,
  High: 20,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function daysUntil(deadline: string, now = new Date()): number {
  return Math.ceil((new Date(deadline).getTime() - now.getTime()) / 86_400_000);
}

export function deadlineNote(daysRemaining: number): string {
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)}d overdue`;
  if (daysRemaining === 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `Due in ${daysRemaining}d`;
}

export function computePriority(task: ScoredTask, now = new Date()): Priority {
  const daysRemaining = daysUntil(task.deadline, now);

  const deadline =
    daysRemaining <= 0
      ? 30
      : clamp(Math.round(30 - daysRemaining * 2.4), 3, 30);
  const workload = clamp(Math.round((task.estimatedHours / 10) * 20), 0, 20);
  const difficulty = DIFFICULTY_SCORE[task.difficulty] ?? 10;
  const importance = IMPORTANCE_SCORE[task.importance] ?? 14;
  const remaining = clamp(
    Math.round(((100 - task.progress) / 100) * 15),
    0,
    15,
  );

  const score = deadline + workload + difficulty + importance + remaining;
  const level: PriorityLevel =
    score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";

  return {
    score,
    level,
    daysRemaining,
    factors: [
      {
        label: "Deadline",
        value: deadline,
        max: 30,
        note: deadlineNote(daysRemaining),
      },
      {
        label: "Workload",
        value: workload,
        max: 20,
        note: `${task.estimatedHours}h estimated`,
      },
      {
        label: "Difficulty",
        value: difficulty,
        max: 15,
        note: task.difficulty,
      },
      {
        label: "Importance",
        value: importance,
        max: 20,
        note: task.importance,
      },
      {
        label: "Remaining",
        value: remaining,
        max: 15,
        note: `${100 - task.progress}% left`,
      },
    ],
  };
}
