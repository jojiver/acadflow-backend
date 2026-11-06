import { SubjectRepository } from "@/repositories/subject-repository";
import type {
  CreateSubjectInput,
  UpdateSubjectInput,
} from "@/schema/subject-schema";

export async function getSubjectsService(userId: string) {
  try {
    const subjects = await new SubjectRepository().findAll(userId);
    return { code: 200, status: "success", data: { subjects } };
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
