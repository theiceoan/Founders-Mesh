import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAttendeeSchema, insertGroupSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/attendees", async (req, res) => {
    try {
      const attendee = insertAttendeeSchema.parse(req.body);
      const created = await storage.createAttendee(attendee);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid attendee data" });
    }
  });

  app.get("/api/attendees", async (_req, res) => {
    const attendees = await storage.getAttendees();
    res.json(attendees);
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const group = insertGroupSchema.parse(req.body);
      const created = await storage.createGroup(group);
      res.json(created);
    } catch (error) {
      res.status(400).json({ error: "Invalid group data" });
    }
  });

  app.get("/api/groups", async (_req, res) => {
    const groups = await storage.getGroups();
    res.json(groups);
  });

  app.post("/api/groups/:groupId/assign/:attendeeId", async (req, res) => {
    try {
      await storage.assignToGroup(
        parseInt(req.params.attendeeId),
        parseInt(req.params.groupId)
      );
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to assign attendee to group" });
    }
  });

  app.post("/api/groups/:groupId/lock", async (req, res) => {
    try {
      await storage.lockGroup(parseInt(req.params.groupId));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to lock group" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
