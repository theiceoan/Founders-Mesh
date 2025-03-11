import { type NextApiRequest, type NextApiResponse } from "next";
import { storage } from "../../../server/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const { groupId } = req.query;

  if (!groupId || Array.isArray(groupId)) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }

  try {
    await storage.lockGroup(parseInt(groupId));
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to lock group" });
  }
}
