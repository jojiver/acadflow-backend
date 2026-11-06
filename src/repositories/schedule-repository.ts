import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { classSchedules } from "@/db/schema";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "@/schema/schedule-schema";

export class ScheduleRepository {
  findAll(userId: string) {
    return db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.userId, userId));
  }

  async findById(id: string, userId: string) {
    const [schedule] = await db
      .select()
      .from(classSchedules)
      .where(
        and(eq(classSchedules.id, id), eq(classSchedules.userId, userId)),
      )
      .limit(1);

    return schedule;
  }

  async create(data: CreateScheduleInput, userId: string) {
    const [schedule] = await db
      .insert(classSchedules)
      .values({ ...data, userId })
      .returning();

    return schedule;
  }

  async update(id: string, data: UpdateScheduleInput, userId: string) {
    const [schedule] = await db
      .update(classSchedules)
      .set(data)
      .where(and(eq(classSchedules.id, id), eq(classSchedules.userId, userId)))
      .returning();

    return schedule;
  }

  async delete(id: string, userId: string) {
    const [schedule] = await db
      .delete(classSchedules)
      .where(and(eq(classSchedules.id, id), eq(classSchedules.userId, userId)))
      .returning();

    return schedule;
  }
}
