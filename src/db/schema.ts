import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const role = pgEnum("Role", ["STUDENT", "ADMIN"]);
export const tokenType = pgEnum("TokenType", ["REFRESH", "EMAIL_VERIFY"]);
export const difficulty = pgEnum("Difficulty", ["Easy", "Medium", "Hard"]);
export const importance = pgEnum("Importance", ["Low", "Medium", "High"]);
export const taskStatus = pgEnum("TaskStatus", [
  "Not started",
  "In progress",
  "Almost done",
  "Completed",
]);

export const users = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().unique().notNull(),
  password: text().notNull(),
  name: text().notNull(),
  studentId: text("student_id"),
  program: text(),
  yearLevel: text("year_level"),
  emailVerified: timestamp("email_verified", {
    withTimezone: true,
    mode: "string",
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  role: role().default("STUDENT").notNull(),
});

export const tokens = pgTable(
  "token",
  {
    id: uuid().defaultRandom().primaryKey(),
    type: tokenType().notNull(),
    token: text().unique().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    consumedAt: timestamp("consumed_at", {
      withTimezone: true,
      mode: "string",
    }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("token_owner_type_idx").on(table.userId, table.type)],
);

export const subjects = pgTable(
  "subject",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    instructor: text(),
    room: text(),
    color: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("subject_owner_idx").on(table.userId)],
);

export const classSchedules = pgTable(
  "class_schedule",
  {
    id: uuid().defaultRandom().primaryKey(),
    day: text().notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    room: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("class_schedule_owner_idx").on(table.userId),
    index("class_schedule_subject_idx").on(table.subjectId),
  ],
);

export const tasks = pgTable(
  "task",
  {
    id: uuid().defaultRandom().primaryKey(),
    title: text().notNull(),
    type: text().notNull().default("Assignment"),
    description: text(),
    deadline: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    estimatedHours: real("estimated_hours").notNull().default(1),
    difficulty: difficulty().default("Medium").notNull(),
    importance: importance().default("Medium").notNull(),
    progress: integer().default(0).notNull(),
    status: taskStatus().default("Not started").notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("task_owner_idx").on(table.userId),
    index("task_subject_idx").on(table.subjectId),
  ],
);

export const taskSteps = pgTable(
  "task_step",
  {
    id: uuid().defaultRandom().primaryKey(),
    label: text().notNull(),
    done: boolean().default(false).notNull(),
    position: integer().default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
  },
  (table) => [index("task_step_task_idx").on(table.taskId)],
);

export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskStep = typeof taskSteps.$inferSelect;
