import { SubjectRepository } from "@/repositories/subject-repository";
import { TaskRepository } from "@/repositories/task-repository";
import { computePriority, daysUntil } from "@/lib/priority";
import type { Subject } from "@/db/schema";
import type {
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/schema/subject-schema";

async function withSummary(subjects: Subject[], userId: string) {
  const tasks = await new TaskRepository().findAll(userId);
  const now = new Date();

  return subjects.map((subject) => {
    const subjectTasks = tasks.filter((task) => task.subjectId === subject.id);
    const total = subjectTasks.length;
    const progress =
      total === 0
        ? 0
        : Math.round(
            subjectTasks.reduce(
              (sum, task) => sum + (task.completedAt ? 100 : task.progress),
              0,
            ) / total,
          );
    const dueNow = subjectTasks.filter((task) => {
      if (task.completedAt) return false;
      const days = daysUntil(task.deadline, now);
      return days >= 0 && days <= 7;
    }).length;
    const levels = subjectTasks.map(
      (task) => computePriority(task, now).level,
    );
    const priority = levels.includes("High")
      ? "High"
      : levels.includes("Medium")
        ? "Medium"
        : "Low";

    return { ...subject, tasks: total, dueNow, progress, priority };
  });
}

export async function getSubjectsService(userId: string) {
  try {
    const subjects = await new SubjectRepository().findAll(userId);
    const enriched = await withSummary(subjects, userId);
    return { code: 200, status: "success", data: { subjects: enriched } };
  } catch (error) {
    console.error("getSubjectsService Error", error);
    return { code: 500, status: "error", message: "Unable to load subjects" };
  }
}

export async function getSubjectService(id: string, userId: string) {
  try {
    const subject = await new SubjectRepository().findById(id, userId);
    if (!subject) {
      return { code: 404, status: "error", message: "Subject not found" };
    }
    return { code: 200, status: "success", data: { subject } };
  } catch (error) {
    console.error("getSubjectService Error", error);
    return { code: 500, status: "error", message: "Unable to load subject" };
  }
}

export async function createSubjectService(
  data: CreateSubjectInput,
  userId: string,
) {
  try {
    const subject = await new SubjectRepository().create(data, userId);
    return { code: 201, status: "success", data: { subject } };
  } catch (error) {
    console.error("createSubjectService Error", error);
    return { code: 500, status: "error", message: "Unable to create subject" };
  }
}

export async function updateSubjectService(
  id: string,
  data: UpdateSubjectInput,
  userId: string,
) {
  try {
    const subject = await new SubjectRepository().update(id, data, userId);
    if (!subject) {
      return { code: 404, status: "error", message: "Subject not found" };
    }
    return { code: 200, status: "success", data: { subject } };
  } catch (error) {
    console.error("updateSubjectService Error", error);
    return { code: 500, status: "error", message: "Unable to update subject" };
  }
}

export async function deleteSubjectService(id: string, userId: string) {
  try {
    const subject = await new SubjectRepository().delete(id, userId);
    if (!subject) {
      return { code: 404, status: "error", message: "Subject not found" };
    }
    return { code: 200, status: "success", message: "Subject deleted" };
  } catch (error) {
    console.error("deleteSubjectService Error", error);
    return { code: 500, status: "error", message: "Unable to delete subject" };
  }
}
