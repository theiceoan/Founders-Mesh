import { type NextApiRequest, type NextApiResponse } from "next";
import { storage } from "../../server/storage";
import { insertAttendeeSchema } from "../../shared/schema";
import { z } from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const attendee = insertAttendeeSchema.parse(req.body);
      const created = await storage.createAttendee(attendee);
      res.status(200).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid attendee data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create attendee" });
      }
    }
  } else if (req.method === "GET") {
    try {
      const attendees = await storage.getAttendees();
      res.status(200).json(attendees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch attendees" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
