import { type NextApiRequest, type NextApiResponse } from "next";
import { storage } from "../../server/storage";
import { insertGroupSchema } from "../../shared/schema";
import { z } from "zod";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const group = insertGroupSchema.parse(req.body);
      const created = await storage.createGroup(group);
      res.status(200).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid group data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create group" });
      }
    }
  } else if (req.method === "GET") {
    try {
      const groups = await storage.getGroups();
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
