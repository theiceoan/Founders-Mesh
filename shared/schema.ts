import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userTypes = ["founder", "investor", "advisor", "ecosystem_partner"] as const;
export const startupStages = ["idea", "mvp", "scaling", "series_a_plus"] as const;
export const challenges = ["fundraising", "hiring", "new_markets", "scaling_ops"] as const;
export const industries = ["saas", "fintech", "healthtech", "ecommerce", "ai_ml", "other"] as const;
export const eventFormats = ["dinner", "roundtable", "mentorship"] as const;

export const attendees = sqliteTable("attendees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userType: text("user_type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  responses: text("responses").notNull(),  // Store JSON as text in SQLite
  groupId: integer("group_id"),
});

export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  format: text("format").notNull(),
  locked: text("locked").default("false"),
});

export const insertAttendeeSchema = createInsertSchema(attendees)
  .extend({
    responses: z.object({
      startupStage: z.enum(startupStages).optional(),
      challenge: z.enum(challenges).optional(),
      industry: z.enum(industries),
      preferredFormat: z.enum(eventFormats),
    }),
  })
  .omit({ id: true, groupId: true });

export const insertGroupSchema = createInsertSchema(groups)
  .omit({ id: true, locked: true });

export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type Attendee = typeof attendees.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;