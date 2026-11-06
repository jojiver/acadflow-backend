import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middlewares/auth-middleware";
import {
  getSchedulesService,
  getScheduleService,
  createScheduleService,
  updateScheduleService,
  deleteScheduleService,
} from "@/services/schedules/schedule-service";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "@/schema/schedule-schema";

export class ScheduleController {
  public getSchedules = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getSchedulesService(userId);
    return res.status(result.code).json(result);
  };

  public getSchedule = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getScheduleService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public createSchedule = async (req: Request, res: Response) => {
    const { body } = createScheduleSchema.parse({ body: req.body });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await createScheduleService(body, userId);
    return res.status(result.code).json(result);
  };

  public updateSchedule = async (req: Request, res: Response) => {
    const { body } = updateScheduleSchema.parse({
      body: req.body,
      params: req.params,
    });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await updateScheduleService(
      req.params.id as string,
      body,
      userId,
    );
    return res.status(result.code).json(result);
  };

  public deleteSchedule = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await deleteScheduleService(
      req.params.id as string,
      userId,
    );
    return res.status(result.code).json(result);
  };
}
