import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { CsrfMiddleware } from "@/middlewares/csrf-middleware";
import { SchemaMiddleware } from "@/middlewares/schema-middleware";
import { RoleValidatorMiddleware } from "@/middlewares/role-validator-middleware";
import { ScheduleController } from "@/controllers/schedule-controller";
import {
  createScheduleSchema,
  scheduleIdSchema,
  updateScheduleSchema,
} from "@/schema/schedule-schema";

const router = Router();
const authMiddleware = new AuthMiddleware();
const csrfMiddleware = new CsrfMiddleware();
const schemaMiddleware = new SchemaMiddleware();
const roleValidatorMiddleware = new RoleValidatorMiddleware();
const scheduleController = new ScheduleController();

const student = [
  authMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
];

router.get("/v1/get-schedules", ...student, scheduleController.getSchedules);
router.get(
  "/v1/get-schedule/:id",
  ...student,
  schemaMiddleware.validate(scheduleIdSchema),
  scheduleController.getSchedule,
);
router.post(
  "/v1/create-schedule",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(createScheduleSchema),
  scheduleController.createSchedule,
);
router.post(
  "/v1/update-schedule/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(updateScheduleSchema),
  scheduleController.updateSchedule,
);
router.post(
  "/v1/delete-schedule/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(scheduleIdSchema),
  scheduleController.deleteSchedule,
);

export default router;
