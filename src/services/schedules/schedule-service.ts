import { ScheduleRepository } from "@/repositories/schedule-repository";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "@/schema/schedule-schema";

export async function getSchedulesService(userId: string) {
  try {
    const schedules = await new ScheduleRepository().findAll(userId);
    return { code: 200, status: "success", data: { schedules } };
  } catch (error) {
    console.error("getSchedulesService Error", error);
    return { code: 500, status: "error", message: "Unable to load schedule" };
  }
}

export async function getScheduleService(id: string, userId: string) {
  try {
    const schedule = await new ScheduleRepository().findById(id, userId);
    if (!schedule) {
      return { code: 404, status: "error", message: "Schedule not found" };
    }
    return { code: 200, status: "success", data: { schedule } };
  } catch (error) {
    console.error("getScheduleService Error", error);
    return { code: 500, status: "error", message: "Unable to load schedule" };
  }
}

export async function createScheduleService(
  data: CreateScheduleInput,
  userId: string,
) {
  try {
    const schedule = await new ScheduleRepository().create(data, userId);
    return { code: 201, status: "success", data: { schedule } };
  } catch (error) {
    console.error("createScheduleService Error", error);
    return { code: 500, status: "error", message: "Unable to create class" };
  }
}

export async function updateScheduleService(
  id: string,
  data: UpdateScheduleInput,
  userId: string,
) {
  try {
    const schedule = await new ScheduleRepository().update(id, data, userId);
    if (!schedule) {
      return { code: 404, status: "error", message: "Schedule not found" };
    }
    return { code: 200, status: "success", data: { schedule } };
  } catch (error) {
    console.error("updateScheduleService Error", error);
    return { code: 500, status: "error", message: "Unable to update class" };
  }
}

export async function deleteScheduleService(id: string, userId: string) {
  try {
    const schedule = await new ScheduleRepository().delete(id, userId);
    if (!schedule) {
      return { code: 404, status: "error", message: "Schedule not found" };
    }
    return { code: 200, status: "success", message: "Class deleted" };
  } catch (error) {
    console.error("deleteScheduleService Error", error);
    return { code: 500, status: "error", message: "Unable to delete class" };
  }
}
