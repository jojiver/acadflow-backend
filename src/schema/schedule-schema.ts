import { z } from "zod";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm (24-hour) time");

const scheduleBody = z.object({
  subjectId: z.uuid("Invalid subject ID"),
  day: z.enum(DAYS),
  startTime: time,
  endTime: time,
  room: z.string().trim().optional(),
});

const scheduleParams = z.object({ id: z.uuid("Invalid schedule ID") });

export const createScheduleSchema = z.object({ body: scheduleBody });
export const scheduleIdSchema = z.object({ params: scheduleParams });
export const updateScheduleSchema = z.object({
  params: scheduleParams,
  body: scheduleBody
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "Provide at least one schedule field",
    ),
});

export type CreateScheduleInput = z.infer<typeof scheduleBody>;
export type UpdateScheduleInput = Partial<CreateScheduleInput>;
