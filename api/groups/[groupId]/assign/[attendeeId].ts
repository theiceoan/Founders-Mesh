import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  const { groupId, attendeeId } = req.query;

  if (!groupId || !attendeeId || Array.isArray(groupId) || Array.isArray(attendeeId)) {
    res.status(400).json({ error: "Invalid groupId or attendeeId" });
    return;
  }

  try {
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign attendee to group" });
  }
}
