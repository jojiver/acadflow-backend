import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import type {
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/schema/subject-schema";

export class SubjectRepository {
  findAll(userId: string) {
    return db.select().from(subjects).where(eq(subjects.userId, userId));
  }

  async findById(id: string, userId: string) {
    const [subject] = await db
      .select()
      .from(subjects)
      .where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
      .limit(1);

    return subject;
  }

  async create(data: CreateSubjectInput, userId: string) {
    const [subject] = await db
      .insert(subjects)
      .values({ ...data, userId })
      .returning();

    return subject;
  }

  async update(id: string, data: UpdateSubjectInput, userId: string) {
    const [subject] = await db
      .update(subjects)
      .set(data)
      .where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
      .returning();

    return subject;
  }

  async delete(id: string, userId: string) {
    const [subject] = await db
      .delete(subjects)
      .where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
      .returning();

    return subject;
  }
}
