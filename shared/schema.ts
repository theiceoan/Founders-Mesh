import { z } from "zod";

export const userTypes = ["founder", "investor", "advisor", "ecosystem_partner"] as const;
export const startupStages = ["idea", "mvp", "scaling", "series_a_plus"] as const;
export const challenges = ["fundraising", "hiring", "new_markets", "scaling_ops"] as const;
export const industries = ["saas", "fintech", "healthtech", "ecommerce", "ai_ml", "other"] as const;
export const eventFormats = ["dinner", "roundtable", "mentorship"] as const;

export const insertAttendeeSchema = z.object({
  userType: z.enum(userTypes),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  responses: z.object({
    startupStage: z.enum(startupStages).optional(),
    challenge: z.enum(challenges).optional(),
    industry: z.enum(industries),
    preferredFormat: z.enum(eventFormats),
  }),
});

export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type Attendee = InsertAttendee & {
  id: number;
  groupId: number | null;
};