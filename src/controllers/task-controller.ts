import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middlewares/auth-middleware";
import {
  getTasksService,
  getTaskService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
} from "@/services/tasks/task-service";
import { createTaskSchema, updateTaskSchema } from "@/schema/task-schema";

export class TaskController {
  public getTasks = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getTasksService(userId);
    return res.status(result.code).json(result);
  };

  public getTask = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getTaskService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public createTask = async (req: Request, res: Response) => {
    const { body } = createTaskSchema.parse({ body: req.body });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await createTaskService(body, userId);
    return res.status(result.code).json(result);
  };

  public updateTask = async (req: Request, res: Response) => {
    const { body } = updateTaskSchema.parse({
      body: req.body,
      params: req.params,
    });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await updateTaskService(
      req.params.id as string,
      body,
      userId,
    );
    return res.status(result.code).json(result);
  };

  public deleteTask = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await deleteTaskService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };
}
