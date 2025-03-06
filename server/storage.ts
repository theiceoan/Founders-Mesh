import { 
  type Attendee, 
  type InsertAttendee, 
  type Group, 
  type InsertGroup,
  userTypes,
  startupStages,
  challenges,
  industries,
  eventFormats
} from "@shared/schema";

// Mock data generation
const mockNames = [
  "Sarah Chen", "Michael Rodriguez", "Emma Thompson", "David Kim", 
  "Priya Patel", "James Wilson", "Lisa Zhang", "Alex Johnson",
  "Maria Garcia", "Tom Anderson", "Ava Williams", "Ryan Taylor",
  "Sophie Martin", "Daniel Lee", "Rachel Brown", "Chris Davis"
];

const mockEmails = (name: string) => `${name.toLowerCase().replace(' ', '.')}@example.com`;

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface IStorage {
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;
  getAttendees(): Promise<Attendee[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  getGroups(): Promise<Group[]>;
  assignToGroup(attendeeId: number, groupId: number): Promise<void>;
  lockGroup(groupId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private attendees: Map<number, Attendee>;
  private groups: Map<number, Group>;
  private attendeeId: number;
  private groupId: number;

  constructor() {
    this.attendees = new Map();
    this.groups = new Map();
    this.attendeeId = 1;
    this.groupId = 1;

    // Generate mock data
    this.generateMockData();
  }

  private generateMockData() {
    // Create mock attendees
    mockNames.forEach(name => {
      const mockAttendee: InsertAttendee = {
        name,
        email: mockEmails(name),
        userType: getRandomElement(userTypes),
        responses: {
          startupStage: getRandomElement(startupStages),
          challenge: getRandomElement(challenges),
          industry: getRandomElement(industries),
          preferredFormat: getRandomElement(eventFormats)
        }
      };
      this.createAttendee(mockAttendee);
    });

    // Create some mock groups
    const mockGroupNames = [
      "SaaS Founders Dinner",
      "FinTech Roundtable",
      "AI/ML Mentorship Circle",
      "HealthTech Innovation Dinner"
    ];

    mockGroupNames.forEach(name => {
      const mockGroup: InsertGroup = {
        name,
        format: getRandomElement(eventFormats)
      };
      this.createGroup(mockGroup);
    });
  }

  async createAttendee(attendee: InsertAttendee): Promise<Attendee> {
    const id = this.attendeeId++;
    const newAttendee: Attendee = { ...attendee, id, groupId: null };
    this.attendees.set(id, newAttendee);
    return newAttendee;
  }

  async getAttendees(): Promise<Attendee[]> {
    return Array.from(this.attendees.values());
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupId++;
    const newGroup: Group = { ...group, id, locked: "false" };
    this.groups.set(id, newGroup);
    return newGroup;
  }

  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async assignToGroup(attendeeId: number, groupId: number): Promise<void> {
    const attendee = this.attendees.get(attendeeId);
    if (!attendee) throw new Error("Attendee not found");

    const group = this.groups.get(groupId);
    if (!group) throw new Error("Group not found");

    this.attendees.set(attendeeId, { ...attendee, groupId });
  }

  async lockGroup(groupId: number): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) throw new Error("Group not found");
    this.groups.set(groupId, { ...group, locked: "true" });
  }
}

export const storage = new MemStorage();