import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middlewares/auth-middleware";
import {
  getSubjectsService,
  getSubjectService,
  createSubjectService,
  updateSubjectService,
  deleteSubjectService,
} from "@/services/subjects/subject-service";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "@/schema/subject-schema";

export class SubjectController {
  public getSubjects = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getSubjectsService(userId);
    return res.status(result.code).json(result);
  };

  public getSubject = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await getSubjectService(req.params.id as string, userId);
    return res.status(result.code).json(result);
  };

  public createSubject = async (req: Request, res: Response) => {
    const { body } = createSubjectSchema.parse({ body: req.body });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await createSubjectService(body, userId);
    return res.status(result.code).json(result);
  };

  public updateSubject = async (req: Request, res: Response) => {
    const { body } = updateSubjectSchema.parse({
      body: req.body,
      params: req.params,
    });
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await updateSubjectService(
      req.params.id as string,
      body,
      userId,
    );
    return res.status(result.code).json(result);
  };

  public deleteSubject = async (req: Request, res: Response) => {
    const userId = (req as AuthenticatedRequest).user!.sub;
    const result = await deleteSubjectService(
      req.params.id as string,
      userId,
    );
    return res.status(result.code).json(result);
  };
}
