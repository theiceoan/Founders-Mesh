import { 
  type Attendee, 
  type InsertAttendee, 
  type Group, 
  type InsertGroup,
  attendees,
  groups
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;
  getAttendees(): Promise<Attendee[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  getGroups(): Promise<Group[]>;
  assignToGroup(attendeeId: number, groupId: number): Promise<void>;
  lockGroup(groupId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createAttendee(attendee: InsertAttendee): Promise<Attendee> {
    // For SQLite, we need to stringify the JSON responses
    const attendeeWithStringResponses = {
      ...attendee,
      responses: JSON.stringify(attendee.responses)
    };

    const [created] = await db
      .insert(attendees)
      .values(attendeeWithStringResponses)
      .returning();

    return {
      ...created,
      responses: JSON.parse(created.responses)
    };
  }

  async getAttendees(): Promise<Attendee[]> {
    const results = await db.select().from(attendees);
    // Parse the JSON responses for each attendee
    return results.map(attendee => ({
      ...attendee,
      responses: JSON.parse(attendee.responses)
    }));
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [created] = await db
      .insert(groups)
      .values(group)
      .returning();
    return created;
  }

  async getGroups(): Promise<Group[]> {
    return db.select().from(groups);
  }

  async assignToGroup(attendeeId: number, groupId: number): Promise<void> {
    await db
      .update(attendees)
      .set({ groupId })
      .where(eq(attendees.id, attendeeId));
  }

  async lockGroup(groupId: number): Promise<void> {
    await db
      .update(groups)
      .set({ locked: "true" })
      .where(eq(groups.id, groupId));
  }
}

// Generate some initial mock data
async function generateMockData(storage: DatabaseStorage) {
  const mockNames = [
    "Sarah Chen", "Michael Rodriguez", "Emma Thompson", "David Kim",
    "Priya Patel", "James Wilson", "Lisa Zhang", "Alex Johnson",
    "Maria Garcia", "Tom Anderson", "Ava Williams", "Ryan Taylor"
  ];

  const userTypes = ["founder", "investor", "advisor", "ecosystem_partner"];
  const industries = ["saas", "fintech", "healthtech", "ecommerce", "ai_ml"];
  const formats = ["dinner", "roundtable", "mentorship"];
  const stages = ["idea", "mvp", "scaling", "series_a_plus"];
  const challenges = ["fundraising", "hiring", "new_markets", "scaling_ops"];

  // Create mock attendees
  for (const name of mockNames) {
    const mockAttendee: InsertAttendee = {
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      userType: userTypes[Math.floor(Math.random() * userTypes.length)],
      responses: {
        startupStage: stages[Math.floor(Math.random() * stages.length)],
        challenge: challenges[Math.floor(Math.random() * challenges.length)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        preferredFormat: formats[Math.floor(Math.random() * formats.length)]
      }
    };
    await storage.createAttendee(mockAttendee);
  }

  // Create mock groups
  const mockGroups = [
    { name: "SaaS Founders Dinner", format: "dinner" },
    { name: "FinTech Roundtable", format: "roundtable" },
    { name: "AI/ML Mentorship Circle", format: "mentorship" },
    { name: "HealthTech Innovation Dinner", format: "dinner" }
  ];

  for (const group of mockGroups) {
    await storage.createGroup(group);
  }
}

export const storage = new DatabaseStorage();
// Initialize mock data
generateMockData(storage).catch(console.error);