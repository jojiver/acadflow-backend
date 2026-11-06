import { z } from "zod";

const text = z.string().trim().min(1);

const subjectBody = z.object({
  name: text,
  instructor: z.string().trim().optional(),
  room: z.string().trim().optional(),
  color: z.string().trim().optional(),
});

const subjectParams = z.object({ id: z.uuid("Invalid subject ID") });

export const createSubjectSchema = z.object({ body: subjectBody });
export const subjectIdSchema = z.object({ params: subjectParams });
export const updateSubjectSchema = z.object({
  params: subjectParams,
  body: subjectBody
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      "Provide at least one subject field",
    ),
});

export type CreateSubjectInput = z.infer<typeof subjectBody>;
export type UpdateSubjectInput = Partial<CreateSubjectInput>;
