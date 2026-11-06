import { Router } from "express";
import authRoutes from "@/routes/auth-routes";
import subjectRoutes from "@/routes/subject-routes";
import scheduleRoutes from "@/routes/schedule-routes";
import taskRoutes from "@/routes/task-routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/subjects", subjectRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/tasks", taskRoutes);

export default router;
