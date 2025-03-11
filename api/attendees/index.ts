import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { insertAttendeeSchema } from "../../shared/schema";
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      console.log('Received quiz submission:', req.body);
      const attendee = insertAttendeeSchema.parse(req.body);
      const created = await storage.createAttendee(attendee);
      console.log('Successfully created attendee:', created);
      res.status(200).json(created);
    } catch (error) {
      console.error('Error creating attendee:', error);
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
      console.error('Error fetching attendees:', error);
      res.status(500).json({ error: "Failed to fetch attendees" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}