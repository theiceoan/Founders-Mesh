import { 
  type Attendee, 
  type InsertAttendee, 
  type Group, 
  type InsertGroup,
  attendees,
  groups
} from "../../shared/schema";
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

export const storage = new DatabaseStorage();
