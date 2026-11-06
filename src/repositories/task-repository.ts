import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { db } from "@/db";
import { subjects, taskSteps, tasks } from "@/db/schema";
import type {
  CreateTaskInput,
  TaskStepInput,
  UpdateTaskInput,
} from "@/schema/task-schema";

type TaskRow = typeof tasks.$inferSelect & {
  subjectName: string | null;
};
type StepRow = typeof taskSteps.$inferSelect;

const selection = {
  ...getTableColumns(tasks),
  subjectName: subjects.name,
};

async function attachSteps(rows: TaskRow[]) {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const steps = await db
    .select()
    .from(taskSteps)
    .where(inArray(taskSteps.taskId, ids));

  return rows.map((row) => ({
    ...row,
    steps: steps
      .filter((step) => step.taskId === row.id)
      .sort((a, b) => a.position - b.position),
  }));
}

export class TaskRepository {
  async findAll(userId: string) {
    const rows = (await db
      .select(selection)
      .from(tasks)
      .leftJoin(subjects, eq(tasks.subjectId, subjects.id))
      .where(eq(tasks.userId, userId))) as TaskRow[];

    return attachSteps(rows);
  }

  async findById(id: string, userId: string) {
    const [row] = (await db
      .select(selection)
      .from(tasks)
      .leftJoin(subjects, eq(tasks.subjectId, subjects.id))
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1)) as TaskRow[];

    if (!row) return undefined;
    const [task] = await attachSteps([row]);
    return task;
  }

  async create(
    data: Omit<CreateTaskInput, "steps"> & { completedAt?: string | null },
    steps: TaskStepInput[] | undefined,
    userId: string,
  ) {
    return db.transaction(async (tx) => {
      const [task] = await tx
        .insert(tasks)
        .values({ ...data, userId })
        .returning();

      let insertedSteps: StepRow[] = [];
      if (steps && steps.length > 0) {
        insertedSteps = await tx
          .insert(taskSteps)
          .values(
            steps.map((step, index) => ({
              taskId: task.id,
              label: step.label,
              done: step.done,
              position: index,
            })),
          )
          .returning();
      }

      return { ...task, steps: insertedSteps };
    });
  }

  async update(
    id: string,
    data: Omit<UpdateTaskInput, "steps"> & { completedAt?: string | null },
    steps: TaskStepInput[] | undefined,
    userId: string,
  ) {
    return db.transaction(async (tx) => {
      const [task] = await tx
        .update(tasks)
        .set(data)
        .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
        .returning();

      if (!task) return undefined;

      if (steps) {
        await tx.delete(taskSteps).where(eq(taskSteps.taskId, id));
        if (steps.length > 0) {
          await tx.insert(taskSteps).values(
            steps.map((step, index) => ({
              taskId: id,
              label: step.label,
              done: step.done,
              position: index,
            })),
          );
        }
      }

      const rows = await tx
        .select()
        .from(taskSteps)
        .where(eq(taskSteps.taskId, id));

      return {
        ...task,
        steps: rows.sort((a, b) => a.position - b.position),
      };
    });
  }

  async delete(id: string, userId: string) {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return task;
  }
}
