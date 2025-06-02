import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const patients = await prisma.patient.findMany({
        orderBy: {
          id: "desc",
        },
      });
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
