import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const count = await prisma.patient.count();
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch count" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
