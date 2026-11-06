import { TaskRepository } from "@/repositories/task-repository";
import { computePriority } from "@/lib/priority";
import type {
  CreateTaskInput,
  TaskStepInput,
  UpdateTaskInput,
} from "@/schema/task-schema";

export type ProductivityPeriod = "today" | "week" | "month";

function deriveProgress(progress: number, steps?: TaskStepInput[]) {
  if (!steps || steps.length === 0) return progress;
  const done = steps.filter((step) => step.done).length;
  return Math.round((done / steps.length) * 100);
}

function deriveCompletedAt(status: string, progress: number) {
  return status === "Completed" || progress >= 100
    ? new Date().toISOString()
    : null;
}

function withPriority<T extends {
  deadline: string;
  estimatedHours: number;
  difficulty: string;
  importance: string;
  progress: number;
}>(task: T) {
  return { ...task, priority: computePriority(task) };
}

const SPAN_DAYS: Record<ProductivityPeriod, number> = {
  today: 1,
  week: 7,
  month: 30,
};

function windowFor(period: ProductivityPeriod, now = new Date()) {
  const span = SPAN_DAYS[period];
  const start = new Date(now);
  start.setDate(start.getDate() - (span - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + span);
  return { start, end };
}

export async function getTasksService(userId: string) {
  try {
    const tasks = await new TaskRepository().findAll(userId);
    return {
      code: 200,
      status: "success",
      data: { tasks: tasks.map(withPriority) },
    };
  } catch (error) {
    console.error("getTasksService Error", error);
    return { code: 500, status: "error", message: "Unable to load tasks" };
  }
}

export async function getTaskService(id: string, userId: string) {
  try {
    const task = await new TaskRepository().findById(id, userId);
    if (!task) {
      return { code: 404, status: "error", message: "Task not found" };
    }
    return { code: 200, status: "success", data: { task: withPriority(task) } };
  } catch (error) {
    console.error("getTaskService Error", error);
    return { code: 500, status: "error", message: "Unable to load task" };
  }
}

export async function createTaskService(
  data: CreateTaskInput,
  userId: string,
) {
  try {
    const { steps, ...rest } = data;
    const progress = deriveProgress(data.progress, steps);
    const completedAt = deriveCompletedAt(data.status, progress);

    const task = await new TaskRepository().create(
      { ...rest, progress, completedAt },
      steps,
      userId,
    );

    return {
      code: 201,
      status: "success",
      data: { task: withPriority(task) },
    };
  } catch (error) {
    console.error("createTaskService Error", error);
    return { code: 500, status: "error", message: "Unable to create task" };
  }
}

export async function updateTaskService(
  id: string,
  data: UpdateTaskInput,
  userId: string,
) {
  const repository = new TaskRepository();

  try {
    const existing = await repository.findById(id, userId);
    if (!existing) {
      return { code: 404, status: "error", message: "Task not found" };
    }

    const { steps, ...rest } = data;
    const progress = steps
      ? deriveProgress(existing.progress, steps)
      : (data.progress ?? existing.progress);
    const status = data.status ?? existing.status;
    const completedAt = deriveCompletedAt(status, progress);

    const task = await repository.update(
      id,
      { ...rest, progress, completedAt },
      steps,
      userId,
    );

    return {
      code: 200,
      status: "success",
      data: { task: withPriority(task!) },
    };
  } catch (error) {
    console.error("updateTaskService Error", error);
    return { code: 500, status: "error", message: "Unable to update task" };
  }
}

export async function deleteTaskService(id: string, userId: string) {
  try {
    const task = await new TaskRepository().delete(id, userId);
    if (!task) {
      return { code: 404, status: "error", message: "Task not found" };
    }
    return { code: 200, status: "success", message: "Task deleted" };
  } catch (error) {
    console.error("deleteTaskService Error", error);
    return { code: 500, status: "error", message: "Unable to delete task" };
  }
}

export async function getProductivityService(
  userId: string,
  periodParam?: string,
) {
  try {
    const period: ProductivityPeriod =
      periodParam === "today" || periodParam === "month"
        ? periodParam
        : "week";
    const tasks = (await new TaskRepository().findAll(userId)).map(
      withPriority,
    );
    const now = new Date();
    const { start, end } = windowFor(period, now);

    const completedTasks = tasks
      .filter((task) => {
        if (!task.completedAt) return false;
        const at = new Date(task.completedAt);
        return at >= start && at <= end;
      })
      .sort(
        (a, b) =>
          new Date(b.completedAt ?? 0).getTime() -
          new Date(a.completedAt ?? 0).getTime(),
      );

    const openTasks = tasks.filter(
      (task) =>
        !task.completedAt &&
        task.progress < 100 &&
        new Date(task.deadline) >= now &&
        new Date(task.deadline) <= end,
    );

    const hours = completedTasks.reduce(
      (sum, task) => sum + task.estimatedHours,
      0,
    );
    const total = completedTasks.length + openTasks.length;

    return {
      code: 200,
      status: "success",
      data: {
        period,
        completed: completedTasks.length,
        hours: Math.round(hours * 10) / 10,
        open: openTasks.length,
        rate: total === 0 ? 0 : Math.round((completedTasks.length / total) * 100),
        completedTasks,
      },
    };
  } catch (error) {
    console.error("getProductivityService Error", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to load productivity",
    };
  }
}
