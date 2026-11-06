import { TaskRepository } from "@/repositories/task-repository";
import type {
  CreateTaskInput,
  TaskStepInput,
  UpdateTaskInput,
} from "@/schema/task-schema";

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

export async function getTasksService(userId: string) {
  try {
    const tasks = await new TaskRepository().findAll(userId);
    return { code: 200, status: "success", data: { tasks } };
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
    return { code: 200, status: "success", data: { task } };
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

    return { code: 201, status: "success", data: { task } };
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

    return { code: 200, status: "success", data: { task } };
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
