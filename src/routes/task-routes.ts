import { Router } from "express";
import { AuthMiddleware } from "@/middlewares/auth-middleware";
import { CsrfMiddleware } from "@/middlewares/csrf-middleware";
import { SchemaMiddleware } from "@/middlewares/schema-middleware";
import { RoleValidatorMiddleware } from "@/middlewares/role-validator-middleware";
import { TaskController } from "@/controllers/task-controller";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "@/schema/task-schema";

const router = Router();
const authMiddleware = new AuthMiddleware();
const csrfMiddleware = new CsrfMiddleware();
const schemaMiddleware = new SchemaMiddleware();
const roleValidatorMiddleware = new RoleValidatorMiddleware();
const taskController = new TaskController();

const student = [
  authMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
];

router.get("/v1/get-tasks", ...student, taskController.getTasks);
router.get(
  "/v1/get-task/:id",
  ...student,
  schemaMiddleware.validate(taskIdSchema),
  taskController.getTask,
);
router.post(
  "/v1/create-task",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(createTaskSchema),
  taskController.createTask,
);
router.post(
  "/v1/update-task/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(updateTaskSchema),
  taskController.updateTask,
);
router.post(
  "/v1/delete-task/:id",
  authMiddleware.execute,
  csrfMiddleware.execute,
  roleValidatorMiddleware.validate("STUDENT"),
  schemaMiddleware.validate(taskIdSchema),
  taskController.deleteTask,
);

export default router;
