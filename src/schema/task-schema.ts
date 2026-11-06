import { z } from "zod";

const step = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Step label is required"),
  done: z.boolean().default(false),
});

const taskBody = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  subjectId: z.uuid("Invalid subject ID").nullable().optional(),
  type: z.string().trim().min(1).default("Assignment"),
  description: z.string().trim().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  estimatedHours: z.number().nonnegative(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  importance: z.enum(["Low", "Medium", "High"]),
  progress: z.number().int().min(0).max(100),
  status: z.enum(["Not started", "In progress", "Almost done", "Completed"]),
  steps: z.array(step).optional(),
});

const taskParams = z.object({ id: z.uuid("Invalid task ID") });

export const createTaskSchema = z.object({ body: taskBody });
export const taskIdSchema = z.object({ params: taskParams });
export const updateTaskSchema = z.object({
  params: taskParams,
  body: taskBody
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "Provide at least one task field",
    ),
});

export type CreateTaskInput = z.infer<typeof taskBody>;
export type UpdateTaskInput = Partial<CreateTaskInput>;
export type TaskStepInput = z.infer<typeof step>;
