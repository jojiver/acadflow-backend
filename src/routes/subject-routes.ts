import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { CsrfMiddleware } from "@/middlewares/csrf-middleware";
import { SchemaMiddleware } from "@/middlewares/schema-middleware";
import { RoleValidatorMiddleware } from "@/middlewares/role-validator-middleware";
import { SubjectController } from "@/controllers/subject-controller";
import {
  createSubjectSchema,
  subjectIdSchema,
  updateSubjectSchema,
} from "@/schema/subject-schema";

const router = Router();
const authMiddleware = new AuthMiddleware();
const csrfMiddleware = new CsrfMiddleware();
const schemaMiddleware = new SchemaMiddleware();
const roleValidatorMiddleware = new RoleValidatorMiddleware();
const subjectController = new SubjectController();

const student = [
  authMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
];

router.get("/v1/get-subjects", ...student, subjectController.getSubjects);
router.get(
  "/v1/get-subject/:id",
  ...student,
  schemaMiddleware.validate(subjectIdSchema),
  subjectController.getSubject,
);
router.post(
  "/v1/create-subject",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(createSubjectSchema),
  subjectController.createSubject,
);
router.post(
  "/v1/update-subject/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(updateSubjectSchema),
  subjectController.updateSubject,
);
router.post(
  "/v1/delete-subject/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(subjectIdSchema),
  subjectController.deleteSubject,
);

export default router;
